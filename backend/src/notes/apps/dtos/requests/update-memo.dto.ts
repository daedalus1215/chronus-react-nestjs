import { IsString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemoDto {
  @ApiProperty({ description: 'The memo ID to update' })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: 'The description/content of the memo' })
  @IsString()
  @IsOptional()
  description?: string;
}
