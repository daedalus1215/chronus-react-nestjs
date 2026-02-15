# Implementation Plan: WebSocket Proxy for Speech-to-Text

## Phase 1: Backend Implementation

### Step 1.1: Install Dependencies

```bash
cd /home/cosmocowboy/Nextcloud/programming/chronus-react-nestjs/backend
npm install @nestjs/websockets@^11.0.0 @nestjs/platform-ws@^11.0.0 ws@^8.16.0
npm install --save-dev @types/ws@^8.5.10
```

### Step 1.2: Create ThothWebSocketClientService

**File:** `backend/src/audio/infrastructure/remote-callers/thoth-websocket-client.service.ts`

**Implementation Details:**
- Singleton service managing single WebSocket connection to thoth-backend
- Reference counting for multiple frontend clients
- Event emitter pattern for transcription messages
- Reconnection logic with exponential backoff (3 attempts)
- Debug logging for connection events (chunks only in debug mode)

**Key Features:**
- `private ws: WebSocket | null = null` - Single connection instance
- `private refCount = 0` - Track number of frontend clients
- `private transcriptionCallbacks = new Map<string, (text: string) => void>()` - Client callbacks
- `async connect(): Promise<void>` - Connect with retry logic
- `registerClient(clientId: string, callback: (text: string) => void): void` - Add client
- `unregisterClient(clientId: string): void` - Remove client
- `sendAudioChunk(chunk: ArrayBuffer): void` - Forward to thoth

### Step 1.3: Create TranscribeAudioGateway

**File:** `backend/src/audio/apps/gateways/transcribe-audio.gateway.ts`

**Implementation Details:**
- NestJS WebSocket gateway using `@WebSocketGateway()` decorator
- Namespace: `/api/audio/transcribe`
- JWT validation from query parameters
- Client management with unique IDs
- Message proxying between frontend and thoth service
- Error handling with wrapped error messages

**Key Features:**
- `@WebSocketServer() server: Server` - Socket.io server instance
- `handleConnection(client: Socket)` - Validate JWT, register client
- `handleDisconnect(client: Socket)` - Unregister client, cleanup
- `@SubscribeMessage('audio-chunk') handleAudioChunk()` - Forward to thoth
- Error codes: `THOTH_UNAVAILABLE`, `AUTH_FAILED`, `INVALID_AUDIO_FORMAT`

### Step 1.4: Update Audio Module

**File:** `backend/src/audio/audio.module.ts`

**Changes:**
- Import `ThothWebSocketClientService` and add to providers
- Import `TranscribeAudioGateway` and add to providers
- Ensure `@nestjs/websockets` module is available

### Step 1.5: Environment Configuration

**File:** `.env` (add to backend)

```bash
# Thoth WebSocket URL
THOTH_WS_URL=ws://172.16.0.49:8443

# Debug mode for chunk logging (optional)
DEBUG_TRANSCRIPTION_CHUNKS=false
```

**File:** `backend/src/config/env.validation.ts` (if exists, add validation)
- Add `THOTH_WS_URL` to required or optional environment variables

### Step 1.6: Write Unit Tests

**File:** `backend/src/audio/infrastructure/remote-callers/thoth-websocket-client.service.spec.ts`

**Test Cases:**
1. Connects to thoth-backend on first client registration
2. Reuses connection for subsequent clients (reference counting)
3. Disconnects from thoth when last client unregisters
4. Retries connection with exponential backoff (3 attempts)
5. Emits transcription messages to correct client callbacks
6. Handles thoth connection errors gracefully

**File:** `backend/src/audio/apps/gateways/transcribe-audio.gateway.spec.ts`

**Test Cases:**
1. Rejects connection without valid JWT
2. Accepts connection with valid JWT
3. Registers client with thoth service
4. Forwards audio chunks to thoth service
5. Forwards transcriptions to correct client
6. Unregisters client on disconnect
7. Handles errors and sends to client

### Step 1.7: Deploy Backend

```bash
cd /home/cosmocowboy/Nextcloud/programming/chronus-react-nestjs/backend
npm run build
npm run start:prod
```

Verify:
- [ ] Backend starts without errors
- [ ] WebSocket gateway is registered
- [ ] Can connect to WebSocket endpoint (test with Postman or wscat)

---

## Phase 2: Frontend Implementation

### Step 2.1: Add Feature Flag

**File:** `frontend/vite.env.config.ts`

Add environment variable:
```typescript
export const env = {
  // ... existing variables
  VITE_USE_TRANSCRIPTION_PROXY: 'false',  // Default to legacy mode
  // ... existing variables
}
```

### Step 2.2: Modify useTranscriptionWebSocket Hook

**File:** `frontend/src/pages/NotePage/hooks/useTranscriptionWebSocket/useTranscriptionWebSocket.ts`

**Changes:**
1. Import environment config
2. Add connection URL logic based on feature flag
3. Include JWT token in WebSocket URL when using proxy
4. Keep existing thoth direct connection as fallback

**Implementation:**
```typescript
const getWebSocketUrl = (): string => {
  if (env.VITE_USE_TRANSCRIPTION_PROXY === 'true') {
    // Connect to chronus-backend proxy
    const apiUrl = env.VITE_API_URL.replace(/^http/, 'ws');
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      throw new Error('No JWT token found');
    }
    return `${apiUrl}/api/audio/transcribe?token=${token}`;
  } else {
    // Legacy: Connect directly to thoth-backend
    return `${env.VITE_THOTH_WS_URL}/stream-audio`;
  }
};
```

### Step 2.3: Update Message Handling

Handle chronus-backend message format:
```typescript
ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    
    if (env.VITE_USE_TRANSCRIPTION_PROXY === 'true') {
      // Handle proxied format
      if (data.type === 'transcription' && data.data) {
        onTranscriptionRef.current?.(data.data);
      } else if (data.type === 'error') {
        setError(data.message);
      }
    } else {
      // Handle legacy thoth format
      if (data.transcription) {
        onTranscriptionRef.current?.(data.transcription);
      }
    }
  } catch (err) {
    console.error('Error parsing message:', err);
  }
};
```

### Step 2.4: Test Both Connection Modes

**Test with VITE_USE_TRANSCRIPTION_PROXY=false:**
- [ ] Records audio
- [ ] Receives transcription
- [ ] Inserts at cursor position

**Test with VITE_USE_TRANSCRIPTION_PROXY=true:**
- [ ] Connects to chronus-backend
- [ ] Receives transcription through proxy
- [ ] Inserts at cursor position
- [ ] Error handling works

### Step 2.5: Deploy Frontend

```bash
cd /home/cosmocowboy/Nextcloud/programming/chronus-react-nestjs/frontend
npm run build
# Deploy build files
```

Deploy with `VITE_USE_TRANSCRIPTION_PROXY=false` (legacy mode active).

---

## Phase 3: Migration

### Step 3.1: Enable in Development

**File:** `frontend/vite.env.config.ts`

```typescript
VITE_USE_TRANSCRIPTION_PROXY: 'true'  // Enable for dev testing
```

Test thoroughly:
- [ ] All transcription features work
- [ ] Error handling works
- [ ] Connection cleanup on disconnect
- [ ] Manual reconnection works

### Step 3.2: Monitor Backend

Check backend logs:
- Connection events logged
- No errors in thoth service connection
- Reference counting working correctly
- Memory usage stable

### Step 3.3: Enable in Production

**File:** `frontend/vite.env.config.ts`

```typescript
VITE_USE_TRANSCRIPTION_PROXY: 'true'  // Enable for production
```

Rebuild and deploy frontend.

### Step 3.4: Monitor for 1 Week

Monitor:
- [ ] No transcription errors
- [ ] WebSocket connections stable
- [ ] Backend performance normal
- [ ] Frontend performance normal

---

## Phase 4: Cleanup

### Step 4.1: Remove Legacy Code

**File:** `frontend/src/pages/NotePage/hooks/useTranscriptionWebSocket/useTranscriptionWebSocket.ts`

- Remove feature flag checks
- Remove direct thoth connection code
- Keep only proxied connection logic

### Step 4.2: Remove Environment Variables

**File:** `frontend/vite.env.config.ts`

Remove:
- `VITE_USE_TRANSCRIPTION_PROXY`
- `VITE_THOTH_WS_URL` (unless used elsewhere)

**File:** Backend `.env`

Keep `THOTH_WS_URL` (required for proxy)
Remove `DEBUG_TRANSCRIPTION_CHUNKS` (if temporary)

### Step 4.3: Update Documentation

- Update README with new architecture
- Update API documentation
- Add troubleshooting guide

### Step 4.4: Final Deployment

Deploy cleanup changes:
```bash
# Backend
cd backend && npm run build && npm run start:prod

# Frontend
cd frontend && npm run build && deploy
```

---

## Rollback Plan

If issues occur after enabling `VITE_USE_TRANSCRIPTION_PROXY`:

1. **Immediate rollback:**
   ```bash
   # Change feature flag and redeploy
   VITE_USE_TRANSCRIPTION_PROXY: 'false'
   ```

2. **Frontend users** will automatically reconnect using legacy mode

3. **Backend** remains unchanged (no breaking changes to REST API)

4. **Investigate issues** in backend logs

5. **Fix and redeploy** when ready

---

## Success Criteria

- [ ] All existing transcription features work with proxy
- [ ] JWT authentication working
- [ ] Error handling improved
- [ ] Connection pooling working (reference counting)
- [ ] No performance degradation
- [ ] Legacy code removed
- [ ] Documentation updated

## Timeline

- **Phase 1 (Backend):** 2-3 days
- **Phase 2 (Frontend):** 1-2 days
- **Phase 3 (Migration):** 1 week monitoring
- **Phase 4 (Cleanup):** 1 day

**Total:** 2-3 weeks including monitoring period
