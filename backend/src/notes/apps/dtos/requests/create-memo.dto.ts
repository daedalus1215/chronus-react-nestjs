import { IsString, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMemoDto {
  @ApiProperty({ description: 'The note ID this memo belongs to' })
  @IsInt()
  @IsNotEmpty()
  noteId: number;

  @ApiProperty({ description: 'The description/content of the memo' })
  @IsString()
  description: string;
}
