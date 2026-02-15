import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as WebSocket from 'ws';

export type TranscriptionCallback = (text: string) => void;

interface ClientRegistration {
  id: string;
  callback: TranscriptionCallback;
}

@Injectable()
export class ThothWebSocketClientService {
  private readonly logger = new Logger(ThothWebSocketClientService.name);
  private ws: WebSocket | null = null;
  private readonly thothWsUrl: string;
  private refCount = 0;
  private readonly clients = new Map<string, ClientRegistration>();
  private isConnecting = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;
  private readonly reconnectDelayBase = 1000; // 1 second base delay

  constructor(private readonly configService: ConfigService) {
    this.thothWsUrl = this.configService.get<string>('THOTH_WS_URL');
    if (!this.thothWsUrl) {
      throw new Error('THOTH_WS_URL environment variable is not set');
    }
    this.logger.log(`Initialized with Thoth WebSocket URL: ${this.thothWsUrl}`);
  }

  /**
   * Get current connection status
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get number of registered clients
   */
  get clientCount(): number {
    return this.refCount;
  }

  /**
   * Connect to thoth-backend WebSocket
   * Idempotent - will not create duplicate connections
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      this.logger.debug('Already connected to thoth-backend');
      return;
    }

    if (this.isConnecting) {
      this.logger.debug('Connection already in progress');
      // Wait for existing connection attempt to complete
      await this.waitForConnection();
      return;
    }

    this.isConnecting = true;

    try {
      await this.establishConnection();
      this.reconnectAttempts = 0;
      this.logger.log('Successfully connected to thoth-backend');
    } catch (error) {
      this.logger.error('Failed to connect to thoth-backend:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect from thoth-backend
   * Only disconnects when ref count reaches 0
   */
  disconnect(): void {
    if (this.refCount > 0) {
      this.logger.warn(
        `Cannot disconnect: ${this.refCount} clients still registered`
      );
      return;
    }

    if (this.ws) {
      this.logger.log('Disconnecting from thoth-backend');
      this.ws.removeAllListeners();
      this.ws.terminate();
      this.ws = null;
    }
  }

  /**
   * Register a client to receive transcription callbacks
   */
  registerClient(id: string, callback: TranscriptionCallback): void {
    this.clients.set(id, { id, callback });
    this.refCount++;
    this.logger.debug(
      `Client registered: ${id}. Total clients: ${this.refCount}`
    );
  }

  /**
   * Unregister a client
   */
  unregisterClient(id: string): void {
    if (this.clients.has(id)) {
      this.clients.delete(id);
      this.refCount--;
      this.logger.debug(
        `Client unregistered: ${id}. Total clients: ${this.refCount}`
      );

      // Disconnect from thoth if no more clients
      if (this.refCount === 0) {
        this.logger.log('No more clients, disconnecting from thoth-backend');
        this.disconnect();
      }
    }
  }

  /**
   * Send audio chunk to thoth-backend
   */
  sendAudioChunk(chunk: ArrayBuffer | Buffer): void {
    if (!this.isConnected) {
      this.logger.warn('Cannot send audio chunk: not connected to thoth-backend');
      return;
    }

    try {
      // Log occasionally to avoid spam (1% of chunks)
      if (Math.random() < 0.01) {
        this.logger.debug(`Sending audio chunk: ${chunk.byteLength} bytes`);
      }
      this.ws.send(chunk);
    } catch (error) {
      this.logger.error('Error sending audio chunk:', error);
    }
  }

  /**
   * Establish WebSocket connection with retry logic
   */
  private async establishConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const attemptConnection = () => {
        try {
          this.logger.log(
            `Connecting to thoth-backend at ${this.thothWsUrl} (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`
          );

          this.ws = new WebSocket(`${this.thothWsUrl}/stream-audio`);

          const timeout = setTimeout(() => {
            if (this.ws?.readyState !== WebSocket.OPEN) {
              this.ws?.terminate();
              handleError(new Error('Connection timeout'));
            }
          }, 10000); // 10 second timeout

          this.ws.on('open', () => {
            clearTimeout(timeout);
            this.setupMessageHandlers();
            resolve();
          });

          this.ws.on('error', (error) => {
            clearTimeout(timeout);
            handleError(error);
          });

          this.ws.on('close', (code, reason) => {
            this.logger.warn(
              `Thoth connection closed: ${code} ${reason?.toString() || ''}`
            );
            this.handleDisconnection();
          });
        } catch (error) {
          handleError(error);
        }
      };

      const handleError = (error: Error) => {
        this.reconnectAttempts++;
        this.logger.error(
          `Connection attempt ${this.reconnectAttempts} failed:`,
          error.message
        );

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(
            new Error(
              `Failed to connect after ${this.maxReconnectAttempts} attempts: ${error.message}`
            )
          );
          return;
        }

        // Exponential backoff
        const delay =
          this.reconnectDelayBase * Math.pow(2, this.reconnectAttempts - 1);
        this.logger.log(`Retrying in ${delay}ms...`);
        setTimeout(attemptConnection, delay);
      };

      attemptConnection();
    });
  }

  /**
   * Setup message handlers for WebSocket
   */
  private setupMessageHandlers(): void {
    if (!this.ws) return;

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());

        // Handle transcription messages from thoth-backend
        if (message.transcription && typeof message.transcription === 'string') {
          const trimmed = message.transcription.trim();
          if (trimmed && trimmed !== 'undefined') {
            this.logger.debug(`Received transcription: "${trimmed}"`);
            this.broadcastTranscription(trimmed);
          }
        }
      } catch (error) {
        this.logger.error('Error parsing message from thoth:', error);
      }
    });

    this.ws.on('ping', () => {
      this.ws?.pong();
    });
  }

  /**
   * Broadcast transcription to all registered clients
   */
  private broadcastTranscription(text: string): void {
    this.clients.forEach((client) => {
      try {
        client.callback(text);
      } catch (error) {
        this.logger.error(`Error calling callback for client ${client.id}:`, error);
      }
    });
  }

  /**
   * Handle unexpected disconnection
   */
  private handleDisconnection(): void {
    this.ws = null;

    // Only attempt reconnection if we have active clients
    if (this.refCount > 0 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelayBase * Math.pow(2, this.reconnectAttempts - 1);
      this.logger.log(
        `Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect().catch((error) => {
          this.logger.error('Reconnection failed:', error);
        });
      }, delay);
    }
  }

  /**
   * Wait for existing connection attempt to complete
   */
  private async waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.isConnecting) {
          clearInterval(checkInterval);
          if (this.isConnected) {
            resolve();
          } else {
            reject(new Error('Connection attempt failed'));
          }
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Timeout waiting for connection'));
      }, 10000);
    });
  }
}
