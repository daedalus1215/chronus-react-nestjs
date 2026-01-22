import { Injectable, NotFoundException } from '@nestjs/common';
import { Memo } from '../../entities/notes/memo.entity';
import { MemoRepository } from '../../../infra/repositories/memo.repository';
import { NoteMemoTagRepository } from '../../../infra/repositories/note-memo-tag.repository';

type CreateMemoParams = {
  noteId: number;
  description: string;
  userId: number;
};

@Injectable()
export class CreateMemoTransactionScript {
  constructor(
    private readonly memoRepository: MemoRepository,
    private readonly noteRepository: NoteMemoTagRepository
  ) {}

  async apply(params: CreateMemoParams): Promise<Memo> {
    const { noteId, description, userId } = params;

    const note = await this.noteRepository.findById(noteId, userId);
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const memo = new Memo();
    memo.noteId = noteId;
    memo.description = description;

    return await this.memoRepository.save(memo);
  }
}
