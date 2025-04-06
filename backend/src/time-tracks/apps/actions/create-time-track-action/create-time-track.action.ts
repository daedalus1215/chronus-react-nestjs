import { Post, Body, Param, ParseIntPipe, Controller, UseGuards } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track.service';
import { CreateTimeTrackSwagger } from './create-time-track.swagger';
import { ProtectedAction } from '../../decorators/protected-action.decorator';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateTimeTrackDto } from '../../dtos/requests/create-time-track.dto';

@Controller(`time-tracks`)
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class CreateTimeTrackAction {
  constructor(
    private readonly timeTrackService: TimeTrackService
  ) {}

  @Post()
  @ProtectedAction(CreateTimeTrackSwagger)
  async apply(
    @Body() dto: CreateTimeTrackDto,
    @Param('noteId', ParseIntPipe) noteId: number,
    @GetAuthUser('userId') userId: string
  ) {
    return this.timeTrackService.createTimeTrack({
      ...dto,
      noteId,
      user: {
        id: userId,
        username: userId
      } 
    });
  }
} 