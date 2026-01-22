import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ description: 'The name of the note' })
  @IsString()
  name: string;
}
