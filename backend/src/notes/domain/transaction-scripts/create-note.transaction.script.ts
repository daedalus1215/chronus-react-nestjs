import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNoteDto } from 'src/notes/apps/dtos/requests/create-note.dto';
import { Note } from 'src/notes/domain/entities/notes/note.entity';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';

@Injectable()
export class CreateNoteTransactionScript {
  constructor(
    @InjectRepository(Note)
    private noteTagRepository: NoteMemoTagRepository
  ) {}

  async apply(
    createNoteDto: CreateNoteDto & { userId: number }
  ): Promise<Note> {
    const { name, userId } = createNoteDto;

    const note = new Note();
    note.name = name;
    note.userId = userId;

    return await this.noteTagRepository.save(note);
  }
}
