import { Controller, Post, Body } from '@nestjs/common';
import { CreateCheckItemDto } from '../../../dtos/requests/create-check-item.dto';
import { CreateCheckItemTransactionScript } from 'src/notes/domain/transaction-scripts/create-check-item.transaction.script';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { CheckItem } from 'src/notes/domain/entities/notes/check-item.entity';
import { CreateCheckItemSwagger } from './create-check-item.swagger';
import { GetAuthUser } from 'src/auth/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/auth/domain/entities/auth-user.entity';

@Controller('notes')
export class CreateCheckItemAction {
  constructor(
    private readonly createCheckItemTransactionScript: CreateCheckItemTransactionScript
  ) {}

  @Post(':noteId/check-items')
  @ProtectedAction(CreateCheckItemSwagger)
  async apply(
    @Body() createCheckItemDto: CreateCheckItemDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<CheckItem> {
    return this.createCheckItemTransactionScript.apply({...createCheckItemDto, authUser});
  }
} 