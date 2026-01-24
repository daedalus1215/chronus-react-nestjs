import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CreateChecklistDto } from '../../dtos/requests/create-checklist.dto';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { CreateChecklistSwagger } from './create-checklist.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { Checklist } from 'src/check-items/domain/entities/checklist.entity';
import { ChecklistService } from 'src/check-items/domain/services/checklist.service';

@Controller('checklists')
export class CreateChecklistAction {
  constructor(private readonly checklistService: ChecklistService) {}

  @Post('/notes/:noteId')
  @ProtectedAction(CreateChecklistSwagger)
  async apply(
    @Body() dto: CreateChecklistDto,
    @Param('noteId', ParseIntPipe) noteId: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<Checklist> {
    return await this.checklistService.createChecklist({
      noteId,
      name: dto.name,
      column: dto.column,
      authUser,
    });
  }
}
