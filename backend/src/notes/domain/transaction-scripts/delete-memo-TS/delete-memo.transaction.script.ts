import { Injectable, NotFoundException } from '@nestjs/common';
import { MemoRepository } from '../../../infra/repositories/memo.repository';
import { NoteMemoTagRepository } from '../../../infra/repositories/note-memo-tag.repository';

type DeleteMemoParams = {
  id: number;
  userId: number;
};

@Injectable()
export class DeleteMemoTransactionScript {
  constructor(
    private readonly memoRepository: MemoRepository,
    private readonly noteRepository: NoteMemoTagRepository
  ) {}

  async apply(params: DeleteMemoParams): Promise<void> {
    const { id, userId } = params;

    const memo = await this.memoRepository.findById(id);
    if (!memo) {
      throw new NotFoundException('Memo not found');
    }

    const note = await this.noteRepository.findById(memo.noteId, userId);
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.memoRepository.delete(id);
  }
}
