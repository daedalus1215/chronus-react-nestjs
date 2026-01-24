import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCheckItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  checklistId: number;
}
