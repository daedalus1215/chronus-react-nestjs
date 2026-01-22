import { Injectable, NotFoundException } from '@nestjs/common';
import { Memo } from '../../entities/notes/memo.entity';
import { MemoRepository } from '../../../infra/repositories/memo.repository';
import { NoteMemoTagRepository } from '../../../infra/repositories/note-memo-tag.repository';

@Injectable()
export class GetMemosByNoteIdTransactionScript {
  constructor(
    private readonly memoRepository: MemoRepository,
    private readonly noteRepository: NoteMemoTagRepository
  ) {}

  async apply(noteId: number, userId: number): Promise<Memo[]> {
    const note = await this.noteRepository.findById(noteId, userId);
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return await this.memoRepository.findByNoteId(noteId);
  }
}
