# Testing Checklist: WebSocket Proxy for Speech-to-Text

## Pre-Deployment Testing

### Backend Unit Tests
- [ ] ThothWebSocketClientService.connect() - connects on first registration
- [ ] ThothWebSocketClientService - reuses connection for subsequent clients
- [ ] ThothWebSocketClientService - reference counting works correctly
- [ ] ThothWebSocketClientService - disconnects when ref count reaches 0
- [ ] ThothWebSocketClientService - retry logic with exponential backoff
- [ ] ThothWebSocketClientService - emits transcription to correct callback
- [ ] ThothWebSocketClientService - handles connection errors gracefully
- [ ] TranscribeAudioGateway - rejects connection without JWT
- [ ] TranscribeAudioGateway - rejects connection with invalid JWT
- [ ] TranscribeAudioGateway - accepts connection with valid JWT
- [ ] TranscribeAudioGateway - registers client on connection
- [ ] TranscribeAudioGateway - forwards audio chunks
- [ ] TranscribeAudioGateway - forwards transcription messages
- [ ] TranscribeAudioGateway - unregisters client on disconnect
- [ ] TranscribeAudioGateway - sends error messages to client

### Integration Tests
- [ ] End-to-end flow with mocked thoth-backend
- [ ] Multiple concurrent client connections
- [ ] Error scenarios (thoth unavailable, auth failure)
- [ ] Connection pooling with reference counting

---

## Manual Testing: Legacy Mode (Direct to Thoth)

**Configuration:** `VITE_USE_TRANSCRIPTION_PROXY: 'false'`

### Connection Tests
- [ ] Open note page
- [ ] Click record button
- [ ] WebSocket connects to thoth-backend directly
- [ ] Connection status shows "connected"

### Audio Recording Tests
- [ ] Speak into microphone
- [ ] Audio chunks sent to thoth-backend
- [ ] Transcription chunks received
- [ ] Text appears in textarea at cursor position

### Error Handling Tests
- [ ] Disconnect network - shows error message
- [ ] Click record without microphone permission - shows permission error
- [ ] Thoth-backend unavailable - shows connection error

### Cleanup Tests
- [ ] Click stop recording - WebSocket closes
- [ ] Navigate away from page - WebSocket closes
- [ ] Close browser tab - WebSocket closes

### Edge Cases
- [ ] Start recording, refresh page - WebSocket reconnects cleanly
- [ ] Multiple rapid start/stop - no connection leaks
- [ ] Long recording session (>5 minutes) - no memory issues

---

## Manual Testing: Proxy Mode (Through Chronus-Backend)

**Configuration:** `VITE_USE_TRANSCRIPTION_PROXY: 'true'`

### Connection Tests
- [ ] Open note page
- [ ] Click record button
- [ ] WebSocket connects to chronus-backend
- [ ] JWT token visible in WebSocket URL query params
- [ ] Connection status shows "connected"
- [ ] Backend logs show new client registration
- [ ] Backend connects to thoth-backend (if first client)

### Audio Recording Tests
- [ ] Speak into microphone
- [ ] Audio chunks sent to chronus-backend
- [ ] Backend forwards chunks to thoth-backend
- [ ] Thoth returns transcription
- [ ] Backend forwards transcription to frontend
- [ ] Text appears in textarea at cursor position

### Authentication Tests
- [ ] Try connecting without JWT - connection rejected
- [ ] Try connecting with invalid JWT - connection rejected
- [ ] Try connecting with expired JWT - connection rejected
- [ ] Valid JWT - connection accepted

### Error Handling Tests
- [ ] Thoth-backend unavailable - backend returns `THOTH_UNAVAILABLE` error
- [ ] Invalid audio format - backend returns `INVALID_AUDIO_FORMAT` error
- [ ] Network disconnect - shows reconnection button
- [ ] Click reconnection button - reconnects successfully

### Connection Pooling Tests
- [ ] Open first note, start recording - backend connects to thoth
- [ ] Open second note, start recording - reuses existing thoth connection
- [ ] Check backend logs - ref count shows 2
- [ ] Stop recording on first note - ref count shows 1, thoth still connected
- [ ] Stop recording on second note - ref count shows 0, thoth disconnects

### Cleanup Tests
- [ ] Click stop recording - WebSocket closes cleanly
- [ ] Backend unregisters client
- [ ] Navigate away from page - cleanup works
- [ ] Check backend logs - no memory leaks

### Edge Cases
- [ ] Start recording in multiple notes simultaneously - all work
- [ ] Rapid connect/disconnect - no connection leaks
- [ ] Long recording session - stable connection
- [ ] Backend restart during recording - shows error, can reconnect

---

## Migration Testing

### Phase 1: Backend Deployed (Feature Inactive)
- [ ] Backend deployed with WebSocket gateway
- [ ] REST API still works normally
- [ ] WebSocket endpoint accessible
- [ ] No impact on existing functionality

### Phase 2: Frontend Deployed (Flag OFF)
- [ ] Frontend deployed with feature flag support
- [ ] Flag set to `false` (legacy mode)
- [ ] Transcription works via direct thoth connection
- [ ] No changes to user experience

### Phase 3: Enable in Dev (Flag ON)
- [ ] Enable flag in development
- [ ] Test all transcription features
- [ ] Monitor backend logs
- [ ] Verify connection pooling
- [ ] Check for console errors

### Phase 4: Enable in Production (Flag ON)
- [ ] Enable flag in production
- [ ] Monitor for 1 week
- [ ] Check error rates
- [ ] Verify performance
- [ ] Collect user feedback

---

## Performance Testing

### Backend Performance
- [ ] Monitor CPU usage during transcription
- [ ] Monitor memory usage (check for leaks)
- [ ] Monitor WebSocket connection count
- [ ] Check response times for transcription proxy
- [ ] Verify single thoth connection maintained

### Frontend Performance
- [ ] No UI lag during recording
- [ ] Smooth text insertion at cursor
- [ ] No memory leaks in browser
- [ ] WebSocket messages processed quickly

### Load Testing (Optional)
- [ ] Multiple simultaneous connections
- [ ] Rapid connect/disconnect cycles
- [ ] Long-duration connections

---

## Security Testing

### Authentication
- [ ] JWT validation working
- [ ] Invalid tokens rejected
- [ ] Expired tokens rejected
- [ ] Missing tokens rejected

### Authorization
- [ ] (Optional enhancement) Note ownership verified
- [ ] Users can't access other users' transcriptions

### Error Information
- [ ] Thoth-backend errors wrapped
- [ ] No internal details leaked to frontend
- [ ] Error codes are generic, not specific

---

## Browser Compatibility

Test transcription in:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if applicable)
- [ ] Mobile browsers (if applicable)

---

## Regression Testing

### Existing Features
- [ ] Note creation still works
- [ ] Note editing still works
- [ ] Audio playback still works
- [ ] Text-to-speech still works
- [ ] Check items still work
- [ ] All other features unaffected

---

## Post-Deployment Verification

### Immediate (Within 1 hour)
- [ ] Backend starts without errors
- [ ] Frontend loads without errors
- [ ] WebSocket connections working
- [ ] Transcription functional

### Short-term (Within 24 hours)
- [ ] No error spikes in logs
- [ ] Performance normal
- [ ] User feedback positive
- [ ] No reported issues

### Long-term (1 Week)
- [ ] Stable operation
- [ ] No memory leaks detected
- [ ] Ready for cleanup phase

---

## Rollback Testing

### Test Rollback Procedure
- [ ] Change feature flag to `false`
- [ ] Rebuild and deploy frontend
- [ ] Verify legacy mode works
- [ ] Check backend still functions
- [ ] Document rollback time (< 5 minutes)

---

## Sign-Off

**Tester:** _______________  
**Date:** _______________  

- [ ] All tests passed
- [ ] Known issues documented
- [ ] Ready for production

**Notes:**
