import { Injectable, NotFoundException } from '@nestjs/common';
import { Memo } from '../../entities/notes/memo.entity';
import { MemoRepository } from '../../../infra/repositories/memo.repository';
import { NoteMemoTagRepository } from '../../../infra/repositories/note-memo-tag.repository';

type UpdateMemoParams = {
  id: number;
  description: string;
  userId: number;
};

@Injectable()
export class UpdateMemoTransactionScript {
  constructor(
    private readonly memoRepository: MemoRepository,
    private readonly noteRepository: NoteMemoTagRepository
  ) {}

  async apply(params: UpdateMemoParams): Promise<Memo> {
    const { id, description, userId } = params;

    const memo = await this.memoRepository.findById(id);
    if (!memo) {
      throw new NotFoundException('Memo not found');
    }

    const note = await this.noteRepository.findById(memo.noteId, userId);
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    memo.description = description;
    return await this.memoRepository.save(memo);
  }
}
