import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateChecklistDto {
  @IsString()
  @IsOptional()
  name?: string | null;

  @IsString()
  @IsIn(['left', 'right'])
  @IsOptional()
  column?: 'left' | 'right';
}
