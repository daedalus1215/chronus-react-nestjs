// src/notes/apps/dtos/update-note.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateNoteDto {
  @ApiProperty({ description: 'The title of the note', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  tags?: { id: string; name: string; description: string }[];

  @IsOptional()
  memos?: { id: string; description: string }[];
}
