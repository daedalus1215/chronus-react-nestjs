import { ApiProperty } from '@nestjs/swagger';
import { Memo } from '../../../domain/entities/notes/memo.entity';

export class MemoResponseDto {
  @ApiProperty()
  id: Memo['id'];

  @ApiProperty()
  description: Memo['description'];

  @ApiProperty()
  noteId: Memo['noteId'];

  @ApiProperty()
  createdAt: Memo['createdAt'];

  @ApiProperty()
  updatedAt: Memo['updatedAt'];
}
