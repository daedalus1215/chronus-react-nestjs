import { Injectable } from '@nestjs/common';
import { Checklist } from '../entities/checklist.entity';
import { ChecklistRepository } from '../../infra/repositories/checklist.repository';
import { GetChecklistsByNoteTransactionScript } from '../transaction-scripts/get-checklists-by-note-TS/get-checklists-by-note.transaction.script';

export type ChecklistProjection = {
  id: number;
  noteId: number;
  name: string | null;
  column: 'left' | 'right';
  order: number;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class ChecklistAggregator {
  constructor(
    private readonly checklistRepository: ChecklistRepository,
    private readonly getChecklistsByNoteTransactionScript: GetChecklistsByNoteTransactionScript
  ) {}

  async findByNoteId(
    noteId: number,
    userId: number
  ): Promise<ChecklistProjection[]> {
    const checklists =
      await this.getChecklistsByNoteTransactionScript.apply({
        noteId,
        userId,
      });

    return checklists.map(checklist => ({
      id: checklist.id,
      noteId: checklist.noteId,
      name: checklist.name,
      column: checklist.column,
      order: checklist.order,
      createdAt: checklist.createdAt,
      updatedAt: checklist.updatedAt,
    }));
  }
}
