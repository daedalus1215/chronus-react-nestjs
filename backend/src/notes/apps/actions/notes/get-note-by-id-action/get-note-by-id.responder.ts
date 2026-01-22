import { Injectable } from '@nestjs/common';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { NoteWithCheckItems } from '../../../../domain/services/note.service';
import { MemoResponseDto } from '../../../dtos/responses/memo.response.dto';

@Injectable()
export class GetNoteByIdResponder {
  apply(input: NoteWithCheckItems): NoteResponseDto {
    const { note, checkItems, memos } = input;
    const memosDto: MemoResponseDto[] = memos.map(memo => ({
      id: memo.id,
      description: memo.description,
      noteId: memo.noteId,
      createdAt: memo.createdAt,
      updatedAt: memo.updatedAt,
    }));
    return {
      id: note.id,
      name: note.name,
      checkItems,
      memos: memosDto,
    };
  }
}
