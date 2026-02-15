# WebSocket Proxy for Speech-to-Text

## Overview

Move speech-to-text streaming from direct frontend→thoth connection to a proxied architecture through chronus-backend. This enables authentication, authorization, and centralized logging while maintaining existing frontend behavior.

**Current Flow:**
```
chronus-frontend ←→ WebSocket ←→ thoth-backend (/stream-audio)
```

**New Flow:**
```
chronus-frontend ←→ WebSocket ←→ chronus-backend ←→ WebSocket ←→ thoth-backend
```

## Status

- **Status:** Draft
- **Priority:** High
- **Owner:** You

## Goals

1. **Security**: Validate JWT and note ownership before allowing transcription
2. **Consistency**: All API calls route through chronus-backend
3. **Gradual Migration**: Feature flag enables safe rollout
4. **Performance**: Connection pooling for thoth-backend connections (single connection for single user)
5. **Maintainability**: Centralized error handling and logging

## Architecture

### Frontend Changes
- **Feature Flag**: `VITE_USE_TRANSCRIPTION_PROXY` environment variable
- **Dual Connection Logic**: Switch between direct thoth connection vs proxied connection
- **No UI Changes**: Text still inserts at cursor position (existing behavior)
- **Manual Reconnection**: User must click button to reconnect (no auto-reconnect)

### Backend Changes
- **ThothWebSocketClientService**: Manages connection pool to thoth-backend
- **TranscribeAudioGateway**: WebSocket gateway with JWT auth
- **Error Wrapping**: Thoth errors wrapped in chronus-backend format
- **Logging**: Connection events always logged; audio chunks only in debug mode

### Connection Pooling Strategy
Since this is a single-user application:
- **Single Connection**: Reuse one thoth-backend WebSocket connection
- **Multiplexing**: Route multiple frontend connections through single thoth connection
- **Reference Counting**: Only disconnect from thoth when all frontend clients disconnect
- **No Timeout**: No maximum session duration enforced

## API Specification

### WebSocket Endpoint

```
URL: ws://{chronus-backend}/api/audio/transcribe?token={JWT}
Protocol: Native WebSocket (ws/wss)
```

### Authentication
- JWT token passed as query parameter
- Token validated on connection
- Connection rejected if invalid/expired

### Message Flow

**Frontend → Backend:**
- Binary audio chunks (same format as thoth-backend expects)

**Backend → Frontend:**
```json
{
  "type": "transcription",
  "data": "transcribed text here",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Error Messages:**
```json
{
  "type": "error",
  "code": "THOTH_CONNECTION_FAILED",
  "message": "Failed to connect to transcription service"
}
```

## Feature Flag Configuration

### Environment Variables

**Backend:**
```bash
THOTH_WS_URL=ws://172.16.0.49:8443
```

**Frontend:**
```bash
VITE_USE_TRANSCRIPTION_PROXY=true  # Enable proxied mode
VITE_THOTH_WS_URL=wss://172.16.0.49:8443  # Keep for legacy mode
```

### Migration Strategy
1. Deploy backend with WebSocket gateway
2. Test with `VITE_USE_TRANSCRIPTION_PROXY=true` in dev
3. Enable in production when ready
4. Remove legacy code after stable period

## Error Handling

### Thoth Connection Errors
- **Retry Logic**: 3 attempts with exponential backoff
- **Fallback**: Return error to frontend, allow retry
- **Logging**: Log connection failures with context

### Error Code Mapping

| Thoth Error | Chronus Error Code | Message |
|-------------|-------------------|---------|
| Connection refused | THOTH_UNAVAILABLE | Transcription service temporarily unavailable |
| Auth failed | AUTH_FAILED | Authentication with transcription service failed |
| Invalid audio | INVALID_AUDIO_FORMAT | Audio format not supported |

## Components

### Backend

#### ThothWebSocketClientService
**Location:** `backend/src/audio/infrastructure/remote-callers/thoth-websocket-client.service.ts`

**Responsibilities:**
- Manage single WebSocket connection to thoth-backend
- Handle connection lifecycle (connect, disconnect, reconnect)
- Forward audio chunks to thoth-backend
- Receive transcription chunks from thoth-backend
- Reference counting for multiple frontend clients
- Error handling and logging

**Public Methods:**
- `connect(): Promise<void>` - Connect to thoth-backend (idempotent)
- `disconnect(): void` - Disconnect when ref count reaches 0
- `sendAudioChunk(chunk: ArrayBuffer): void` - Forward audio to thoth
- `onTranscription(callback: (text: string) => void): void` - Subscribe to transcriptions
- `get isConnected(): boolean` - Check connection status

#### TranscribeAudioGateway
**Location:** `backend/src/audio/apps/gateways/transcribe-audio.gateway.ts`

**Responsibilities:**
- WebSocket gateway for frontend connections
- JWT authentication on connection
- Proxy audio chunks: frontend → thoth-backend
- Proxy transcriptions: thoth-backend → frontend
- Manage client subscriptions
- Error handling and forwarding

**Events:**
- `connection` - New client connected (with JWT validation)
- `disconnect` - Client disconnected
- `audio-chunk` - Binary audio data from client
- `transcription` - Text transcription to client
- `error` - Error message to client

### Frontend

#### useTranscriptionWebSocket Hook
**Location:** `frontend/src/pages/NotePage/hooks/useTranscriptionWebSocket/useTranscriptionWebSocket.ts`

**Changes:**
- Check `VITE_USE_TRANSCRIPTION_PROXY` environment variable
- If `true`: Connect to chronus-backend WebSocket
- If `false` or undefined: Connect directly to thoth-backend (legacy)
- Include JWT token in WebSocket URL query params when using proxy

**Connection URL Logic:**
```typescript
if (env.VITE_USE_TRANSCRIPTION_PROXY === 'true') {
  const apiUrl = env.VITE_API_URL.replace(/^http/, 'ws');
  const token = localStorage.getItem('jwt_token');
  wsUrl = `${apiUrl}/api/audio/transcribe?token=${token}`;
} else {
  wsUrl = `${env.VITE_THOTH_WS_URL}/stream-audio`;
}
```

## Testing Requirements

### Unit Tests
- ThothWebSocketClientService connection lifecycle
- Gateway authentication logic
- Error wrapping and forwarding
- Connection pooling reference counting

### Integration Tests
- End-to-end WebSocket flow with mocked thoth-backend
- Feature flag switching
- Error scenarios (thoth down, auth failure)

### Manual Testing Checklist
- [ ] Feature flag OFF: Direct thoth connection works
- [ ] Feature flag ON: Proxied connection works
- [ ] JWT validation rejects invalid tokens
- [ ] Transcription inserts at cursor position
- [ ] Error messages display correctly
- [ ] Connection cleanup on disconnect
- [ ] Multiple connections share single thoth connection
- [ ] Reference counting works correctly

## Deployment Plan

### Phase 1: Backend
- [ ] Install WebSocket dependencies
- [ ] Implement ThothWebSocketClientService
- [ ] Implement TranscribeAudioGateway
- [ ] Write unit tests
- [ ] Deploy to production (feature inactive)

### Phase 2: Frontend
- [ ] Add feature flag support
- [ ] Modify useTranscriptionWebSocket hook
- [ ] Test both connection modes
- [ ] Deploy with flag OFF

### Phase 3: Migration
- [ ] Enable flag in dev environment
- [ ] Monitor for issues
- [ ] Enable in production
- [ ] Monitor for 1 week

### Phase 4: Cleanup
- [ ] Remove legacy direct connection code
- [ ] Remove feature flag
- [ ] Update documentation

## Open Questions (Resolved)

**Q: Should frontend automatically reconnect if chronus-backend WebSocket disconnects?**
A: No, user must click button to reconnect.

**Q: What level of detail for transcription logging?**
A: Connection events always, audio chunks only in debug mode.

**Q: Maximum transcription session duration?**
A: None needed (single user).

## Dependencies

### Backend
```json
{
  "@nestjs/websockets": "^11.0.0",
  "@nestjs/platform-ws": "^11.0.0",
  "ws": "^8.16.0"
}
```

### Dev Dependencies
```json
{
  "@types/ws": "^8.5.10"
}
```

## Files to Create/Modify

### New Files
- `backend/src/audio/infrastructure/remote-callers/thoth-websocket-client.service.ts`
- `backend/src/audio/apps/gateways/transcribe-audio.gateway.ts`
- `backend/src/audio/apps/gateways/transcribe-audio.gateway.spec.ts`
- `backend/src/audio/infrastructure/remote-callers/thoth-websocket-client.service.spec.ts`

### Modified Files
- `backend/src/audio/audio.module.ts` - Add gateway and service providers
- `backend/package.json` - Add WebSocket dependencies
- `frontend/src/pages/NotePage/hooks/useTranscriptionWebSocket/useTranscriptionWebSocket.ts` - Add feature flag logic
- `frontend/vite.env.config.ts` - Add `VITE_USE_TRANSCRIPTION_PROXY`

## Security Considerations

1. **JWT Validation**: Gateway validates JWT on every connection
2. **Note Ownership**: Verify user owns note before allowing transcription (optional enhancement)
3. **Rate Limiting**: Not needed for single user
4. **Input Validation**: Validate audio chunk size/format
5. **Secure WebSocket**: Use `wss://` in production
6. **Error Information**: Don't leak internal thoth-backend details in error messages

## Performance Considerations

1. **Connection Pooling**: Single thoth connection reduces resource usage
2. **Reference Counting**: Efficiently handle multiple frontend connections
3. **Memory Management**: Proper cleanup of WebSocket connections and event listeners
4. **Audio Chunk Size**: Pass through unchanged (no transformation)
5. **No Timeout**: Unlimited session duration for single user

## Future Enhancements

1. **Metrics**: Track transcription latency, connection duration
2. **Caching**: Cache transcription results for repeated audio
3. **Language Selection**: Pass language preference through proxy
4. **Multi-user Support**: Enhance connection pooling for multiple concurrent users
5. **Transcription Persistence**: Store transcriptions in database (if needed)

## References

- [TRANSCRIPTION_FEATURE_SPEC.md](../../TRANSCRIPTION_FEATURE_SPEC.md) - Original transcription feature specification
- [NestJS WebSocket Documentation](https://docs.nestjs.com/websockets/gateways)
- [ws library documentation](https://github.com/websockets/ws)
