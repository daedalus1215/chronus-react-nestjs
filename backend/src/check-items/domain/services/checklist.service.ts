import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Checklist } from '../entities/checklist.entity';
import { CreateChecklistTransactionScript } from '../transaction-scripts/create-checklist-TS/create-checklist.transaction.script';
import { UpdateChecklistTransactionScript } from '../transaction-scripts/update-checklist-TS/update-checklist.transaction.script';
import { DeleteChecklistTransactionScript } from '../transaction-scripts/delete-checklist-TS/delete-checklist.transaction.script';
import { GetChecklistsByNoteTransactionScript } from '../transaction-scripts/get-checklists-by-note-TS/get-checklists-by-note.transaction.script';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { VERIFY_NOTE_ACCESS_COMMAND } from 'src/shared-kernel/domain/cross-domain-commands/notes/verify-note-access.command';

@Injectable()
export class ChecklistService {
  constructor(
    private readonly createChecklistTransactionScript: CreateChecklistTransactionScript,
    private readonly updateChecklistTransactionScript: UpdateChecklistTransactionScript,
    private readonly deleteChecklistTransactionScript: DeleteChecklistTransactionScript,
    private readonly getChecklistsByNoteTransactionScript: GetChecklistsByNoteTransactionScript,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async createChecklist(dto: {
    authUser: AuthUser;
    noteId: number;
    name?: string | null;
    column?: 'left' | 'right';
  }): Promise<Checklist> {
    await this.eventEmitter.emitAsync(VERIFY_NOTE_ACCESS_COMMAND, {
      noteId: dto.noteId,
      userId: dto.authUser.userId,
    });

    return this.createChecklistTransactionScript.apply({
      noteId: dto.noteId,
      name: dto.name,
      column: dto.column,
      userId: dto.authUser.userId,
    });
  }

  async updateChecklist(dto: {
    authUser: AuthUser;
    id: number;
    name?: string | null;
    column?: 'left' | 'right';
    order?: number;
  }): Promise<Checklist> {
    return this.updateChecklistTransactionScript.apply({
      id: dto.id,
      name: dto.name,
      column: dto.column,
      order: dto.order,
      userId: dto.authUser.userId,
    });
  }

  async deleteChecklist(dto: {
    authUser: AuthUser;
    id: number;
  }): Promise<void> {
    return this.deleteChecklistTransactionScript.apply({
      id: dto.id,
      userId: dto.authUser.userId,
    });
  }

  async getChecklistsByNoteId(
    noteId: number,
    authUser: AuthUser
  ): Promise<Checklist[]> {
    return this.getChecklistsByNoteTransactionScript.apply({
      noteId,
      userId: authUser.userId,
    });
  }
}
