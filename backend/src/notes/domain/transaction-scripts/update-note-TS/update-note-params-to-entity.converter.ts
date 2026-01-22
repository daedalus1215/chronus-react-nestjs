import { Injectable } from '@nestjs/common';
import { UpdateNoteParams } from './update-note.params';
import { Note } from '../../entities/notes/note.entity';

@Injectable()
export class UpdateNoteParamsToEntityConverter {
  apply(updateNoteParams: UpdateNoteParams, note: Note): Note {
    const updatedNote: Note = {
      ...note,
      name: updateNoteParams.name,
    };

    return updatedNote;
  }
}
