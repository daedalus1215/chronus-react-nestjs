import { IsString, IsOptional, IsIn, IsNumber } from 'class-validator';

export class UpdateChecklistDto {
  @IsString()
  @IsOptional()
  name?: string | null;

  @IsString()
  @IsIn(['left', 'right'])
  @IsOptional()
  column?: 'left' | 'right';

  @IsNumber()
  @IsOptional()
  order?: number;
}
