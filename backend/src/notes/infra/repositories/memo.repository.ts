import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memo } from '../../domain/entities/notes/memo.entity';

@Injectable()
export class MemoRepository {
  constructor(
    @InjectRepository(Memo)
    private readonly repository: Repository<Memo>
  ) {}

  async findById(id: number): Promise<Memo | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByNoteId(noteId: number): Promise<Memo[]> {
    return this.repository.find({ where: { noteId } });
  }

  async save(memo: Memo): Promise<Memo> {
    return this.repository.save(memo);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
