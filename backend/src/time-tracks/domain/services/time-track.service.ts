import { Injectable  } from '@nestjs/common';
import { NoteAggregator } from '../../../notes/domain/aggregators/note.aggregator';
import { CreateTimeTrackTransactionScript } from '../transaction-scripts/create-time-track.transaction.script';
import { CreateTimeTrackCommand } from '../transaction-scripts/create-time-track-TS/create-time-track.command';
import { GetNoteTimeTracksTransactionScript } from '../transaction-scripts/get-note-time-tracks-TS/get-note-time-tracks.transaction.script';
import { GetNoteTimeTracksCommand } from '../transaction-scripts/get-note-time-tracks-TS/get-note-time-tracks.command';

type ValidateTimeTrackCreationCommand = {
  noteId: number;
  user: {
    id: string;
  };
};

@Injectable()
export class TimeTrackService {
  constructor(
    private readonly createTimeTrackTS: CreateTimeTrackTransactionScript,
    private readonly getNoteTimeTracksTS: GetNoteTimeTracksTransactionScript,
    private readonly noteAggregator: NoteAggregator,
  ) {}

  async createTimeTrack(command: CreateTimeTrackCommand) {
    await this.validateTimeTrackCreation(command);
    return this.createTimeTrackTS.apply(command);
  }

  private async validateTimeTrackCreation(command: ValidateTimeTrackCreationCommand) {
    await this.noteAggregator.belongsToUser({
      noteId: command.noteId,
      user: {
        id: parseInt(command.user.id)
      }
    });
  }

  async getNoteTimeTracks(command: GetNoteTimeTracksCommand) {
    await this.validateTimeTrackCreation(command);
    return this.getNoteTimeTracksTS.apply(command);
  }
}