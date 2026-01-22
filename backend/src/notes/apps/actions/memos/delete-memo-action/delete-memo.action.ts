import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { DeleteMemoTransactionScript } from 'src/notes/domain/transaction-scripts/delete-memo-TS/delete-memo.transaction.script';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { DeleteMemoSwagger } from './delete-memo.swagger';

@Controller('memos')
export class DeleteMemoAction {
  constructor(
    private readonly deleteMemoTransactionScript: DeleteMemoTransactionScript
  ) {}

  @Delete(':id')
  @ProtectedAction(DeleteMemoSwagger)
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @GetAuthUser('userId') userId: number
  ): Promise<void> {
    return await this.deleteMemoTransactionScript.apply({ id, userId });
  }
}
