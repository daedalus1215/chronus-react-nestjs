import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateNoteDto } from "src/notes/apps/dtos/requests/update-note.dto";
import { NoteMemoTagRepository } from "../../../infra/repositories/note-memo-tag.repository";
import { NoteResponseDto } from "../../../apps/dtos/responses/note.response.dto";
import { NoteDtoToEntityConverter } from "./note-dto-to-entity.converter";

@Injectable()
export class UpdateNoteTransactionScript {
  constructor(
    private readonly noteRepository: NoteMemoTagRepository,
    private readonly noteDtoToEntityConverter: NoteDtoToEntityConverter
  ) {}

  async apply(id: number, updateNoteDto: UpdateNoteDto): Promise<NoteResponseDto> {
    const note = await this.noteRepository.findById(id);

    if (!note) {
      throw new NotFoundException("Note not found");
    }

    return new NoteResponseDto(await this.noteRepository.save(this.noteDtoToEntityConverter.apply(updateNoteDto, note)));
  }
}
