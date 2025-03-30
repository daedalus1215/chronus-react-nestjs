import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetNoteByIdTransactionScript } from '../../domain/transaction-scripts/get-note-by-id.transaction.script';
import { NoteResponseDto } from '../dtos/responses/note.response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetAuthUser } from 'src/auth/get-auth-user.decorator';

@ApiTags('Notes')
@Controller('notes')
@ApiBearerAuth()
export class GetNoteByIdAction {
  constructor(
    private readonly getNoteByIdTransactionScript: GetNoteByIdTransactionScript
  ) {}

  @Get('detail/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a note by ID' })
  @ApiResponse({ status: 200, description: 'Returns the note.', type: NoteResponseDto })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own this note.' })
  async apply(
    @Param('id') id: string,
    @GetAuthUser('userId') userId: string
  ): Promise<NoteResponseDto> {
    return await this.getNoteByIdTransactionScript.apply(parseInt(id, 10), userId);
  }
} 