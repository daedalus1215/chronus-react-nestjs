import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class TextToSpeechRequestDto {
  @ApiProperty({ description: 'ID of the note' })
  @IsNumber()
  noteId: number;

  @ApiProperty({
    description: 'ID of the memo to convert to speech. Required if note has multiple memos.',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  memoId?: number;
}

export class TextToSpeechResponseDto {
  file_path: string;
}
