import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GetMemosByNoteIdTransactionScript } from 'src/notes/domain/transaction-scripts/get-memos-by-note-id-TS/get-memos-by-note-id.transaction.script';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { MemoResponseDto } from '../../../dtos/responses/memo.response.dto';
import { GetMemosByNoteIdSwagger } from './get-memos-by-note-id.swagger';
import { GetMemosByNoteIdResponder } from './get-memo-by-note-id.responder';

@Controller('memos')
export class GetMemosByNoteIdAction {
  constructor(
    private readonly getMemosByNoteIdTransactionScript: GetMemosByNoteIdTransactionScript,
    private readonly getMemosByNoteIdResponder: GetMemosByNoteIdResponder
  ) {}

  @Get('notes/:noteId')
  @ProtectedAction(GetMemosByNoteIdSwagger)
  async apply(
    @Param('noteId', ParseIntPipe) noteId: number,
    @GetAuthUser('userId') userId: number
  ): Promise<MemoResponseDto[]> {
    const memos = await this.getMemosByNoteIdTransactionScript.apply(
      noteId,
      userId
    );
    return this.getMemosByNoteIdResponder.apply(memos);
  }
}
