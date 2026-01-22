import { Injectable } from '@nestjs/common';
import { Memo } from '../../../../domain/entities/notes/memo.entity';
import { MemoResponseDto } from '../../../dtos/responses/memo.response.dto';

@Injectable()
export class GetMemosByNoteIdResponder {
  apply(memos: Memo[]): MemoResponseDto[] {
    return memos.map(memo => ({
      id: memo.id,
      description: memo.description,
      noteId: memo.noteId,
      createdAt: memo.createdAt,
      updatedAt: memo.updatedAt,
    }));
  }
}
