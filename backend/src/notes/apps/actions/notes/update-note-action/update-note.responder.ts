import { Injectable } from '@nestjs/common';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { NoteWithCheckItems } from '../../../../domain/services/note.service';

@Injectable()
export class UpdateNoteResponder {

  apply(input: NoteWithCheckItems): NoteResponseDto {
    const { note, checkItems, memos } = input;
    return {
      id: note.id,
      name: note.name,
      checkItems,
      memos,
    };
  }
}
