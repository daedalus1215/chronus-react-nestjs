# Tasks: WebSocket Proxy for Speech-to-Text

## Backend Tasks

### Task B1: Install WebSocket Dependencies
**Status:** ⬜ Pending  
**Priority:** High  
**Estimate:** 10 minutes

**Description:**
Install required WebSocket packages for NestJS backend.

**Steps:**
1. [ ] Navigate to backend directory
2. [ ] Install `@nestjs/websockets`, `@nestjs/platform-ws`, `ws`
3. [ ] Install dev dependency `@types/ws`
4. [ ] Verify package.json updated correctly

**Command:**
```bash
cd /home/cosmocowboy/Nextcloud/programming/chronus-react-nestjs/backend
npm install @nestjs/websockets@^11.0.0 @nestjs/platform-ws@^11.0.0 ws@^8.16.0
npm install --save-dev @types/ws@^8.5.10
```

---

### Task B2: Create ThothWebSocketClientService
**Status:** ⬜ Pending  
**Priority:** High  
**Estimate:** 2-3 hours

**Description:**
Create service that manages single WebSocket connection to thoth-backend with reference counting.

**File:** `backend/src/audio/infrastructure/remote-callers/thoth-websocket-client.service.ts`

**Acceptance Criteria:**
- [ ] Service is injectable NestJS provider
- [ ] Connects to thoth-backend using `THOTH_WS_URL` env variable
- [ ] Implements reference counting (`refCount` property)
- [ ] Connects on first client registration
- [ ] Disconnects when ref count reaches 0
- [ ] Forwards audio chunks to thoth-backend
- [ ] Emits transcription events to registered callbacks
- [ ] Handles connection errors with retry logic (3 attempts, exponential backoff)
- [ ] Logs connection events (not chunk-level in production)

**Methods to Implement:**
- [ ] `connect(): Promise<void>`
- [ ] `disconnect(): void`
- [ ] `registerClient(clientId: string, callback: (text: string) => void): void`
- [ ] `unregisterClient(clientId: string): void`
- [ ] `sendAudioChunk(chunk: ArrayBuffer): void`
- [ ] `get isConnected(): boolean`

---

### Task B3: Create TranscribeAudioGateway
**Status:** ⬜ Pending  
**Priority:** High  
**Estimate:** 3-4 hours

**Description:**
Create NestJS WebSocket gateway that proxies transcription requests.

**File:** `backend/src/audio/apps/gateways/transcribe-audio.gateway.ts`

**Acceptance Criteria:**
- [ ] Gateway uses `@WebSocketGateway()` decorator
- [ ] Namespace set to `/api/audio/transcribe`
- [ ] JWT validation from query parameter `token`
- [ ] Rejects connection if JWT invalid/expired
- [ ] Registers client with ThothWebSocketClientService on connection
- [ ] Unregisters client on disconnect
- [ ] Forwards binary audio chunks to thoth service
- [ ] Forwards transcription messages to client
- [ ] Wraps errors in chronus format with error codes
- [ ] Handles cleanup on disconnect

**Error Codes:**
- [ ] `THOTH_UNAVAILABLE` - Connection to thoth failed
- [ ] `AUTH_FAILED` - JWT validation failed
- [ ] `INVALID_AUDIO_FORMAT` - Audio format not supported

**Methods to Implement:**
- [ ] `handleConnection(client: Socket): Promise<void>`
- [ ] `handleDisconnect(client: Socket): void`
- [ ] `@SubscribeMessage('audio-chunk') handleAudioChunk(client: Socket, chunk: ArrayBuffer): void`
- [ ] `sendTranscription(client: Socket, text: string): void`
- [ ] `sendError(client: Socket, code: string, message: string): void`

---

### Task B4: Update Audio Module
**Status:** ⬜ Pending  
**Priority:** High  
**Estimate:** 30 minutes

**Description:**
Register new gateway and service in audio module.

**File:** `backend/src/audio/audio.module.ts`

**Acceptance Criteria:**
- [ ] Import `ThothWebSocketClientService`
- [ ] Import `TranscribeAudioGateway`
- [ ] Add both to `providers` array
- [ ] Ensure no circular dependencies
- [ ] Module compiles without errors

---

### Task B5: Add Environment Variables
**Status:** ⬜ Pending  
**Priority:** High  
**Estimate:** 15 minutes

**Description:**
Add required environment variables to backend configuration.

**Files to Modify:**
- [ ] `.env` - Add `THOTH_WS_URL`
- [ ] Environment validation (if exists) - Add validation for `THOTH_WS_URL`

**Variables:**
```bash
THOTH_WS_URL=ws://172.16.0.49:8443
DEBUG_TRANSCRIPTION_CHUNKS=false  # Optional
```

---

### Task B6: Write Unit Tests for ThothWebSocketClientService
**Status:** ⬜ Pending  
**Priority:** Medium  
**Estimate:** 2-3 hours

**Description:**
Create comprehensive unit tests for the WebSocket client service.

**File:** `backend/src/audio/infrastructure/remote-callers/thoth-websocket-client.service.spec.ts`

**Test Cases:**
- [ ] Connects to thoth-backend on first `registerClient()` call
- [ ] Reuses existing connection for subsequent clients
- [ ] Increments ref count on each registration
- [ ] Decrements ref count on each unregistration
- [ ] Disconnects from thoth when ref count reaches 0
- [ ] Retries connection up to 3 times with exponential backoff
- [ ] Emits transcription to correct client callback
- [ ] Handles multiple clients with different callbacks
- [ ] Handles connection errors gracefully
- [ ] Properly cleans up WebSocket on disconnect

---

### Task B7: Write Unit Tests for TranscribeAudioGateway
**Status:** ⬜ Pending  
**Priority:** Medium  
**Estimate:** 2-3 hours

**Description:**
Create comprehensive unit tests for the WebSocket gateway.

**File:** `backend/src/audio/apps/gateways/transcribe-audio.gateway.spec.ts`

**Test Cases:**
- [ ] Rejects connection without JWT token
- [ ] Rejects connection with invalid JWT token
- [ ] Accepts connection with valid JWT token
- [ ] Registers client with thoth service on valid connection
- [ ] Forwards audio chunks to thoth service
- [ ] Forwards transcription messages to client
- [ ] Unregisters client from thoth service on disconnect
- [ ] Sends error message to client on thoth error
- [ ] Handles multiple concurrent connections
- [ ] Properly cleans up on client disconnect

---

### Task B8: Deploy Backend
**Status:** ⬜ Pending  
**Priority:** High  
**Estimate:** 30 minutes

**Description:**
Build and deploy backend with new WebSocket functionality.

**Steps:**
1. [ ] Run tests: `npm run test`
2. [ ] Build: `npm run build`
3. [ ] Deploy: `npm run start:prod`
4. [ ] Verify WebSocket endpoint is accessible
5. [ ] Test connection with Postman or wscat

**Verification:**
- [ ] Backend starts without errors
- [ ] WebSocket gateway registered in logs
- [ ] Can connect to `ws://backend/api/audio/transcribe`

---

## Frontend Tasks

### Task F1: Add Feature Flag Environment Variable
**Status:** ⬜ Pending  
**Priority:** High  
**Estimate:** 15 minutes

**Description:**
Add feature flag to control proxy vs direct connection.

**File:** `frontend/vite.env.config.ts`

**Acceptance Criteria:**
- [ ] Add `VITE_USE_TRANSCRIPTION_PROXY` with default `'false'`
- [ ] Keep existing `VITE_THOTH_WS_URL` for legacy mode
- [ ] TypeScript types updated if needed

---

### Task F2: Modify useTranscriptionWebSocket Hook
**Status:** ⬜ Pending  
**Priority:** High  
**Estimate:** 2-3 hours

**Description:**
Add logic to switch between direct and proxied connection based on feature flag.

**File:** `frontend/src/pages/NotePage/hooks/useTranscriptionWebSocket/useTranscriptionWebSocket.ts`

**Acceptance Criteria:**
- [ ] Import environment configuration
- [ ] Check `VITE_USE_TRANSCRIPTION_PROXY` flag
- [ ] When `true`: Connect to chronus-backend with JWT in URL
- [ ] When `false`: Connect directly to thoth-backend (legacy)
- [ ] Parse proxied message format (with `type` field)
- [ ] Parse legacy message format (with `transcription` field)
- [ ] Handle error messages from proxy
- [ ] Maintain existing API (same hook interface)

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

---

### Task F3: Test Legacy Mode (Feature Flag OFF)
**Status:** ⬜ Pending  
**Priority:** High  
**Estimate:** 1 hour

**Description:**
Verify transcription works with direct thoth connection.

**Configuration:**
```typescript
VITE_USE_TRANSCRIPTION_PROXY: 'false'
```

**Test Checklist:**
- [ ] Records audio successfully
- [ ] WebSocket connects to thoth-backend
- [ ] Receives transcription chunks
- [ ] Text inserts at cursor position
- [ ] Error handling works
- [ ] Connection cleanup on stop

---

### Task F4: Test Proxy Mode (Feature Flag ON)
**Status:** ⬜ Pending  
**Priority:** High  
**Estimate:** 1 hour

**Description:**
Verify transcription works through chronus-backend proxy.

**Configuration:**
```typescript
VITE_USE_TRANSCRIPTION_PROXY: 'true'
```

**Test Checklist:**
- [ ] Records audio successfully
- [ ] WebSocket connects to chronus-backend
- [ ] JWT token included in URL
- [ ] Receives transcription through proxy
- [ ] Text inserts at cursor position
- [ ] Error messages display correctly
- [ ] Connection cleanup on stop
- [ ] Manual reconnection works

---

### Task F5: Deploy Frontend
**Status:** ⬜ Pending  
**Priority:** High  
**Estimate:** 30 minutes

**Description:**
Build and deploy frontend with feature flag support.

**Configuration:**
```typescript
VITE_USE_TRANSCRIPTION_PROXY: 'false'  // Keep legacy mode active initially
```

**Steps:**
1. [ ] Build: `npm run build`
2. [ ] Deploy build files
3. [ ] Verify deployment

---

## Migration Tasks

### Task M1: Enable in Development
**Status:** ⬜ Pending  
**Priority:** High  
**Estimate:** 30 minutes

**Description:**
Enable proxy mode in development environment for testing.

**Configuration:**
```typescript
VITE_USE_TRANSCRIPTION_PROXY: 'true'
```

**Test Checklist:**
- [ ] All transcription features work
- [ ] No console errors
- [ ] Error handling works
- [ ] Connection cleanup works
- [ ] Manual reconnection works

---

### Task M2: Monitor Backend
**Status:** ⬜ Pending  
**Priority:** Medium  
**Estimate:** Ongoing

**Description:**
Monitor backend during development testing.

**Check:**
- [ ] Connection events logged
- [ ] No errors in thoth service connection
- [ ] Reference counting working (logs show correct counts)
- [ ] Memory usage stable (no leaks)
- [ ] Single thoth connection maintained

---

### Task M3: Enable in Production
**Status:** ⬜ Pending  
**Priority:** High  
**Estimate:** 30 minutes

**Description:**
Enable proxy mode in production.

**Configuration:**
```typescript
VITE_USE_TRANSCRIPTION_PROXY: 'true'
```

**Steps:**
1. [ ] Update feature flag
2. [ ] Rebuild frontend
3. [ ] Deploy to production
4. [ ] Verify deployment
5. [ ] Test transcription functionality

---

### Task M4: Monitor Production (1 Week)
**Status:** ⬜ Pending  
**Priority:** High  
**Estimate:** 1 week

**Description:**
Monitor production usage for 1 week.

**Daily Checks:**
- [ ] No transcription errors
- [ ] WebSocket connections stable
- [ ] Backend CPU/memory normal
- [ ] Frontend performance normal
- [ ] User reports no issues

**Log Review:**
- [ ] Check backend logs for errors
- [ ] Check frontend console for errors
- [ ] Verify connection metrics

---

## Cleanup Tasks

### Task C1: Remove Feature Flag
**Status:** ⬜ Pending  
**Priority:** Low  
**Estimate:** 1 hour

**Description:**
Remove feature flag and legacy code after stable period.

**Files to Modify:**
- [ ] `frontend/vite.env.config.ts` - Remove `VITE_USE_TRANSCRIPTION_PROXY`
- [ ] `frontend/vite.env.config.ts` - Remove `VITE_THOTH_WS_URL` (if not used elsewhere)
- [ ] `useTranscriptionWebSocket.ts` - Remove feature flag checks
- [ ] `useTranscriptionWebSocket.ts` - Remove legacy connection code
- [ ] `useTranscriptionWebSocket.ts` - Keep only proxied connection logic

---

### Task C2: Update Documentation
**Status:** ⬜ Pending  
**Priority:** Low  
**Estimate:** 1 hour

**Description:**
Update project documentation.

**Documentation to Update:**
- [ ] README.md - Update architecture diagram
- [ ] README.md - Update environment variables section
- [ ] API documentation - Add WebSocket endpoint docs
- [ ] Add troubleshooting guide
- [ ] Update TRANSCRIPTION_FEATURE_SPEC.md

---

### Task C3: Final Deployment
**Status:** ⬜ Pending  
**Priority:** Low  
**Estimate:** 30 minutes

**Description:**
Deploy cleanup changes.

**Steps:**
- [ ] Deploy updated backend (no changes needed)
- [ ] Build and deploy cleaned frontend
- [ ] Verify everything works
- [ ] Archive old documentation

---

## Summary

### Task Counts
- **Backend:** 8 tasks
- **Frontend:** 5 tasks
- **Migration:** 4 tasks
- **Cleanup:** 3 tasks
- **Total:** 20 tasks

### Time Estimates
- **Backend:** ~10-12 hours
- **Frontend:** ~4-5 hours
- **Migration:** ~1 week (mostly monitoring)
- **Cleanup:** ~2-3 hours
- **Total:** ~3-4 weeks including monitoring

### Priority Order
1. B1, B2, B3, B4, B5 (Backend core)
2. B6, B7 (Backend tests)
3. F1, F2 (Frontend core)
4. B8, F3, F4, F5 (Deploy and test both modes)
5. M1, M2, M3, M4 (Migration)
6. C1, C2, C3 (Cleanup)
