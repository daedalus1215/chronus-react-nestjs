import { Controller, Post, Body } from '@nestjs/common';
import { CreateMemoDto } from '../../../dtos/requests/create-memo.dto';
import { CreateMemoTransactionScript } from 'src/notes/domain/transaction-scripts/create-memo-TS/create-memo.transaction.script';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { MemoResponseDto } from '../../../dtos/responses/memo.response.dto';
import { CreateMemoSwagger } from './create-memo.swagger';
import { CreateMemoResponder } from './create-memo.responder';

@Controller('memos')
export class CreateMemoAction {
  constructor(
    private readonly createMemoTransactionScript: CreateMemoTransactionScript,
    private readonly createMemoResponder: CreateMemoResponder
  ) { }

  @Post()
  @ProtectedAction(CreateMemoSwagger)
  async apply(
    @GetAuthUser('userId') userId: number,
    @Body() createMemoDto: CreateMemoDto
  ): Promise<MemoResponseDto> {
    const memo = await this.createMemoTransactionScript.apply({
      ...createMemoDto,
      userId,
    });
    return this.createMemoResponder.apply(memo);
  }
}
