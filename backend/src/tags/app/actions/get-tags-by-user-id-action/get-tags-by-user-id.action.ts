import { Controller, Get } from '@nestjs/common';
import { TagService } from '../../../domain/services/tag.service';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetTagsByUserIdSwagger } from './get-tags-by-user-id.swagger';
import { TagWithCount } from 'src/tags/domain/transaction-scripts/get-tags-by-user-id.transaction.script';

@Controller('tags')
export class GetTagsByUserIdAction {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ProtectedAction(GetTagsByUserIdSwagger)
  async apply(@GetAuthUser('userId') userId: number): Promise<TagWithCount[]> {
    return this.tagService.getTagsByUserId(userId);
  }
} 