import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track.service';
import { GetNoteTimeTracksSwagger } from './get-note-time-tracks.swagger';
import { ProtectedAction } from '../../decorators/protected-action.decorator';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/users/domain/entities/user.entity';

@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class GetNoteTimeTracksAction {
  constructor(
    private readonly timeTrackService: TimeTrackService
  ) {}

  @Get('note/:noteId')
  @ProtectedAction(GetNoteTimeTracksSwagger)
  async apply(
    @Param('noteId', ParseIntPipe) noteId: number,
    @GetAuthUser() user: User
  ) {
    return this.timeTrackService.getNoteTimeTracks({
      noteId,
      user: {
        id: user.id.toString(),
        username: user.username
      }
    });
  }
} 