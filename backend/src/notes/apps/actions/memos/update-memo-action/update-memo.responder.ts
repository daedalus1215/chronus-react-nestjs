import { Injectable } from '@nestjs/common';
import { Memo } from '../../../../domain/entities/notes/memo.entity';
import { MemoResponseDto } from '../../../dtos/responses/memo.response.dto';

@Injectable()
export class UpdateMemoResponder {
  apply(memo: Memo): MemoResponseDto {
    return {
      id: memo.id,
      description: memo.description,
      noteId: memo.noteId,
      createdAt: memo.createdAt,
      updatedAt: memo.updatedAt,
    };
  }
}
