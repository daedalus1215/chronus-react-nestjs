import { ApiProperty } from '@nestjs/swagger';
import { Note } from '../../../domain/entities/notes/note.entity';
import { Tag } from '../../../domain/entities/tag/tag.entity';

export class NoteResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [Tag] })
  tags: Tag[];

  constructor(note: Note) {
    this.id = note.id;
    this.name = note.name;
    this.content = note.content;
    this.userId = note.userId;
    this.createdAt = note.createdAt;
    this.updatedAt = note.updatedAt;
    this.tags = note.tags;
  }
} 