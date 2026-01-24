import { Checklist } from '../../../domain/entities/checklist.entity';
import { CheckItemResponseDto } from './check-item.response.dto';
import { CheckItem } from 'src/check-items/domain/entities/check-item.entity';

export class ChecklistResponseDto {
  id: number;
  noteId: number;
  name: string | null;
  column: 'left' | 'right';
  order: number;
  createdAt: string;
  updatedAt: string;
  checkItems?: CheckItemResponseDto[];

  constructor(checklist: Checklist) {
    this.id = checklist.id;
    this.noteId = checklist.noteId;
    this.name = checklist.name;
    this.column = checklist.column;
    this.order = checklist.order;
    this.createdAt = checklist.createdAt;
    this.updatedAt = checklist.updatedAt;
    if (checklist.checkItems) {
      this.checkItems = checklist.checkItems.map(
        item => new CheckItemResponseDto(item as CheckItem)
      );
    }
  }
}
