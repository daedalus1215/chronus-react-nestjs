import { Controller, Put, Body } from '@nestjs/common';
import { UpdateMemoDto } from '../../../dtos/requests/update-memo.dto';
import { UpdateMemoTransactionScript } from 'src/notes/domain/transaction-scripts/update-memo-TS/update-memo.transaction.script';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { MemoResponseDto } from '../../../dtos/responses/memo.response.dto';
import { UpdateMemoResponder } from './update-memo.responder';
import { UpdateMemoSwagger } from './update-memo.swagger';

@Controller('memos')
export class UpdateMemoAction {
  constructor(
    private readonly updateMemoTransactionScript: UpdateMemoTransactionScript,
    private readonly updateMemoResponder: UpdateMemoResponder
  ) {}

  @Put()
  @ProtectedAction(UpdateMemoSwagger)
  async apply(
    @GetAuthUser('userId') userId: number,
    @Body() updateMemoDto: UpdateMemoDto
  ): Promise<MemoResponseDto> {
    const memo = await this.updateMemoTransactionScript.apply({
      id: updateMemoDto.id,
      description: updateMemoDto.description,
      userId,
    });
    return this.updateMemoResponder.apply(memo);
  }
}
