import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { GetNoteTimeTracksCommand } from './get-note-time-tracks.command';
import { NoteAggregator } from '../../../../notes/domain/aggregators/note.aggregator';

@Injectable()
export class GetNoteTimeTracksTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository,
    private readonly noteAggregator: NoteAggregator
  ) {}

  async apply(command: GetNoteTimeTracksCommand) {
    await this.noteAggregator.belongsToUser({
      noteId: command.noteId,
      user: {
        id: parseInt(command.user.id)
      }
    });

    return this.timeTrackRepository.findByUserIdAndNoteId(
      command.user.id,
      command.noteId
    );
  }
} 