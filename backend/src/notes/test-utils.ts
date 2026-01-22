import { UpdateNoteDto } from './apps/dtos/requests/update-note.dto';
import { Note } from './domain/entities/notes/note.entity';
import { createMockMemo } from './test-utils/mock-factories';

export const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  id: 1,
  name: 'Original Note',
  userId: 1,
  archivedAt: null,
  memos: [{ id: 1, description: 'Original Description', noteId: 1, note: createMockNote(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockUpdateNoteDto = (
  overrides: Partial<UpdateNoteDto> = {}
): UpdateNoteDto => ({
  name: 'Updated Note',
  memos: [{ id: '1', description: 'Updated Description' }],
  tags: [],
  ...overrides,
});
