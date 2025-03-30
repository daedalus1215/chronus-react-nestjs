import { NoteResponseDto } from '../../dtos/responses/note.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/decorators/protected-action.decorator';

export const GetNoteByIdSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Get a note by ID',
  additionalResponses: [
    { 
      status: 200, 
      description: 'Returns the note.', 
      type: NoteResponseDto 
    },
    { 
      status: 404, 
      description: 'Note not found.' 
    }
  ]
}; 