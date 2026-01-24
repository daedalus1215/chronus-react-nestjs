import { CheckItem } from '../../../domain/entities/check-item.entity';

export class CheckItemResponseDto {
  id: number;
  name: string;
  doneDate: Date | null;
  archiveDate: Date | null;
  noteId: number;
  checklistId: number | null;
  createdAt: string;
  updatedAt: string;

  constructor(checkItem: CheckItem) {
    this.id = checkItem.id;
    this.name = checkItem.name;
    this.doneDate = checkItem.doneDate;
    this.archiveDate = checkItem.archiveDate;
    this.noteId = checkItem.noteId;
    this.checklistId = checkItem.checklistId ?? null;
    this.createdAt =
      checkItem.createdAt instanceof Date
        ? checkItem.createdAt.toISOString()
        : String(checkItem.createdAt);
    this.updatedAt =
      checkItem.updatedAt instanceof Date
        ? checkItem.updatedAt.toISOString()
        : String(checkItem.updatedAt);
  }
}
