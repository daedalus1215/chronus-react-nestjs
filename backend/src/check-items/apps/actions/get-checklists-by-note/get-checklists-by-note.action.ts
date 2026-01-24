import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetChecklistsByNoteSwagger } from './get-checklists-by-note.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { Checklist } from 'src/check-items/domain/entities/checklist.entity';
import { ChecklistService } from 'src/check-items/domain/services/checklist.service';

@Controller('checklists')
export class GetChecklistsByNoteAction {
  constructor(private readonly checklistService: ChecklistService) {}

  @Get('/notes/:noteId')
  @ProtectedAction(GetChecklistsByNoteSwagger)
  async apply(
    @Param('noteId', ParseIntPipe) noteId: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<Checklist[]> {
    return await this.checklistService.getChecklistsByNoteId(noteId, authUser);
  }
}
