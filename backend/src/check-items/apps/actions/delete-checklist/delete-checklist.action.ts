import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { DeleteChecklistSwagger } from './delete-checklist.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ChecklistService } from 'src/check-items/domain/services/checklist.service';

@Controller('checklists')
export class DeleteChecklistAction {
  constructor(private readonly checklistService: ChecklistService) {}

  @Delete('/:id')
  @ProtectedAction(DeleteChecklistSwagger)
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<void> {
    return await this.checklistService.deleteChecklist({
      id,
      authUser,
    });
  }
}
