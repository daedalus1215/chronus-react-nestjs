import { Controller, Get, Param } from '@nestjs/common';
import { TagService } from '../../../domain/services/tag.service';
import { TagResponseDto } from '../../dtos/responses/tag.response.dto';
import { AuthUser, GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { GetTagsByNoteIdSwagger } from './get-tags-by-note-id.swagger';

@Controller('tags')
export class GetTagsByNoteIdAction {
  constructor(private readonly tagService: TagService) {}

  @Get('/note/:id')
  @ProtectedAction(GetTagsByNoteIdSwagger)
  async apply(
    @Param('id') id: string,
    @GetAuthUser() user: AuthUser
  ): Promise<TagResponseDto[]> {
    console.log('getTagsByNoteIdAction', id, user.userId);
    return this.tagService.getTagsByNoteId(Number(id), user.userId);
  }
} 