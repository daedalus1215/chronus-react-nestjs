import { ApiProperty } from '@nestjs/swagger';
import { Note } from '../../../domain/entities/notes/note.entity';
import { CheckItem } from 'src/check-items/domain/entities/check-item.entity';

export class NoteResponseDto {
  @ApiProperty()
  id: Note['id'];

  @ApiProperty()
  name: Note['name'];

  @ApiProperty()
  checkItems: CheckItem[];

  @ApiProperty()
  isMemo: boolean;
}