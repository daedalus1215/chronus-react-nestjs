import { UpdateNoteDto } from "./apps/dtos/requests/update-note.dto";
import { Note } from "./domain/entities/notes/note.entity";


export const createMockNote = (overrides: Partial<Note> = {}): Note => ({
    id: 1,
    name: 'Original Note',
    userId: 'user123',
    archived_date: null,
    memo: null,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  });

  export const createMockUpdateNoteDto = (overrides: Partial<UpdateNoteDto> = {}): UpdateNoteDto => ({
    name: 'Updated Note',
    description: 'Updated Description',
    tags: [],
    ...overrides
  });
