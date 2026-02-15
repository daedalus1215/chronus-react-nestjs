# 005: WebSocket Proxy for Speech-to-Text

## Overview

This spec covers the implementation of a WebSocket proxy architecture that moves speech-to-text streaming from direct frontend→thoth connection to a proxied flow through chronus-backend.

## Quick Links

- **[spec.md](./spec.md)** - Complete specification document
- **[plan.md](./plan.md)** - Detailed implementation plan
- **[tasks.md](./tasks.md)** - Task breakdown with checkboxes
- **[checklists/testing.md](./checklists/testing.md)** - Testing checklist

## Status

- **Current Phase:** Planning
- **Status:** Draft
- **Priority:** High

## Architecture

```
Current Flow:
chronus-frontend ←→ WebSocket ←→ thoth-backend (/stream-audio)

New Flow:
chronus-frontend ←→ WebSocket ←→ chronus-backend ←→ WebSocket ←→ thoth-backend
```

## Key Features

1. **Authentication & Authorization** - JWT validation before allowing transcription
2. **Connection Pooling** - Single thoth connection reused for all frontend clients
3. **Gradual Migration** - Feature flag enables safe rollout
4. **Error Wrapping** - Thoth errors wrapped in chronus format
5. **Logging** - Connection events logged (chunks only in debug mode)

## Quick Start

### Backend
```bash
cd backend
npm install @nestjs/websockets @nestjs/platform-ws ws
npm install --save-dev @types/ws
```

Add to `.env`:
```bash
THOTH_WS_URL=ws://172.16.0.49:8443
```

### Frontend
Add to `vite.env.config.ts`:
```typescript
VITE_USE_TRANSCRIPTION_PROXY: 'false'  // 'true' to enable proxy mode
```

## Implementation Timeline

1. **Phase 1: Backend** (2-3 days)
   - Install dependencies
   - Create ThothWebSocketClientService
   - Create TranscribeAudioGateway
   - Write tests

2. **Phase 2: Frontend** (1-2 days)
   - Add feature flag
   - Modify useTranscriptionWebSocket hook
   - Test both modes

3. **Phase 3: Migration** (1 week)
   - Enable in development
   - Enable in production
   - Monitor for issues

4. **Phase 4: Cleanup** (1 day)
   - Remove legacy code
   - Update documentation

## Testing

See [checklists/testing.md](./checklists/testing.md) for complete testing checklist.

## Success Criteria

- [ ] All existing transcription features work with proxy
- [ ] JWT authentication working
- [ ] Error handling improved
- [ ] Connection pooling working (reference counting)
- [ ] No performance degradation
- [ ] Legacy code removed
- [ ] Documentation updated

## Rollback

If issues occur, simply change feature flag:
```typescript
VITE_USE_TRANSCRIPTION_PROXY: 'false'
```

Redeploy frontend to revert to legacy mode.

## Questions?

See [spec.md](./spec.md) for detailed documentation or check [tasks.md](./tasks.md) for implementation steps.
