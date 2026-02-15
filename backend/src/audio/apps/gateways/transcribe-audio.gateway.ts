import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import * as WebSocketLib from 'ws';
import { Server } from 'ws';
import { JwtService } from '@nestjs/jwt';
import { ThothWebSocketClientService } from '../../infrastructure/remote-callers/thoth-websocket-client.service';

// Use the ws library's WebSocket type for the client
interface AuthenticatedWebSocket extends WebSocketLib {
  userId?: number;
  clientId?: string;
}

interface TranscriptionMessage {
  type: 'transcription';
  data: string;
  timestamp: string;
}

interface ErrorMessage {
  type: 'error';
  code: string;
  message: string;
}

@WebSocketGateway({
  path: '/api/audio/transcribe',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class TranscribeAudioGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TranscribeAudioGateway.name);

  constructor(
    private readonly thothClient: ThothWebSocketClientService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Handle new WebSocket connection
   * Validates JWT token from query parameters
   */
  async handleConnection(client: AuthenticatedWebSocket): Promise<void> {
    try {
      // Extract token from query parameters
      const token = this.extractTokenFromUrl(client.url);

      if (!token) {
        this.logger.warn('Connection attempt without token');
        this.sendError(client, 'AUTH_FAILED', 'Authentication required');
        client.close(4001, 'Authentication required');
        return;
      }

      // Validate JWT token
      let payload;
      try {
        payload = this.jwtService.verify(token);
      } catch (error) {
        this.logger.warn('Invalid JWT token:', error.message);
        this.sendError(client, 'AUTH_FAILED', 'Invalid authentication token');
        client.close(4001, 'Invalid authentication token');
        return;
      }

      // Extract user ID from payload
      const userId = payload.sub || payload.userId;
      if (!userId) {
        this.logger.warn('JWT token missing user ID');
        this.sendError(client, 'AUTH_FAILED', 'Invalid token format');
        client.close(4001, 'Invalid token format');
        return;
      }

      // Store user info on socket
      client.userId = userId;
      client.clientId = this.generateClientId();

      this.logger.log(
        `Client connected: ${client.clientId} (user: ${userId})`
      );

      // Register client with thoth service
      this.thothClient.registerClient(client.clientId, (text: string) => {
        this.sendTranscription(client, text);
      });

      // Connect to thoth-backend (will reuse existing connection if available)
      try {
        await this.thothClient.connect();
        this.logger.debug(
          `Client ${client.clientId} connected to transcription service`
        );
      } catch (error) {
        this.logger.error(
          `Failed to connect to thoth-backend for client ${client.clientId}:`,
          error.message
        );
        this.sendError(
          client,
          'THOTH_UNAVAILABLE',
          'Transcription service temporarily unavailable'
        );
        // Don't close connection immediately, allow client to retry
      }

      // Setup ping/pong to keep connection alive
      this.setupHeartbeat(client);
    } catch (error) {
      this.logger.error('Error handling connection:', error);
      this.sendError(client, 'INTERNAL_ERROR', 'Internal server error');
      client.close(1011, 'Internal server error');
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: AuthenticatedWebSocket): void {
    if (client.clientId) {
      this.logger.log(`Client disconnected: ${client.clientId}`);
      this.thothClient.unregisterClient(client.clientId);
    }
  }

  /**
   * Handle audio chunk from client
   */
  @SubscribeMessage('audio-chunk')
  handleAudioChunk(
    client: AuthenticatedWebSocket,
    payload: ArrayBuffer | Buffer,
  ): void {
    if (!client.clientId) {
      this.logger.warn('Received audio chunk from unregistered client');
      return;
    }

    if (!this.thothClient.isConnected) {
      this.logger.warn(
        `Client ${client.clientId} sent audio but thoth is not connected`
      );
      this.sendError(
        client,
        'THOTH_UNAVAILABLE',
        'Transcription service not connected'
      );
      return;
    }

    try {
      // Forward audio chunk to thoth-backend
      this.thothClient.sendAudioChunk(payload);
    } catch (error) {
      this.logger.error(
        `Error forwarding audio chunk for client ${client.clientId}:`,
        error
      );
      this.sendError(
        client,
        'INTERNAL_ERROR',
        'Failed to process audio'
      );
    }
  }

  /**
   * Send transcription message to client
   */
  private sendTranscription(
    client: AuthenticatedWebSocket,
    text: string,
  ): void {
    if (client.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: TranscriptionMessage = {
      type: 'transcription',
      data: text,
      timestamp: new Date().toISOString(),
    };

    try {
      client.send(JSON.stringify(message));
    } catch (error) {
      this.logger.error(
        `Error sending transcription to client ${client.clientId}:`,
        error
      );
    }
  }

  /**
   * Send error message to client
   */
  private sendError(
    client: AuthenticatedWebSocket,
    code: string,
    message: string,
  ): void {
    if (client.readyState !== WebSocket.OPEN) {
      return;
    }

    const errorMessage: ErrorMessage = {
      type: 'error',
      code,
      message,
    };

    try {
      client.send(JSON.stringify(errorMessage));
    } catch (error) {
      this.logger.error('Error sending error message:', error);
    }
  }

  /**
   * Extract JWT token from WebSocket URL query parameters
   */
  private extractTokenFromUrl(url: string): string | null {
    try {
      const parsedUrl = new URL(url, 'http://localhost');
      return parsedUrl.searchParams.get('token');
    } catch {
      // Fallback for relative URLs
      const match = url.match(/[?&]token=([^&]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    }
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup heartbeat/ping-pong to keep connection alive
   */
  private setupHeartbeat(client: AuthenticatedWebSocket): void {
    const pingInterval = setInterval(() => {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000); // Ping every 30 seconds

    client.addEventListener('close', () => {
      clearInterval(pingInterval);
    });

    client.addEventListener('error', () => {
      clearInterval(pingInterval);
    });
  }
}
