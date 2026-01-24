import { Controller, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { UpdateChecklistDto } from '../../dtos/requests/update-checklist.dto';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { UpdateChecklistSwagger } from './update-checklist.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { Checklist } from 'src/check-items/domain/entities/checklist.entity';
import { ChecklistService } from 'src/check-items/domain/services/checklist.service';

@Controller('checklists')
export class UpdateChecklistAction {
  constructor(private readonly checklistService: ChecklistService) {}

  @Patch('/:id')
  @ProtectedAction(UpdateChecklistSwagger)
  async apply(
    @Body() dto: UpdateChecklistDto,
    @Param('id', ParseIntPipe) id: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<Checklist> {
    return await this.checklistService.updateChecklist({
      id,
      name: dto.name,
      column: dto.column,
      order: dto.order,
      authUser,
    });
  }
}
