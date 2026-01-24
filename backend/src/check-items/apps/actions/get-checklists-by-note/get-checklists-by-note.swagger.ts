import { ChecklistResponseDto } from '../../dtos/responses/checklist.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const GetChecklistsByNoteSwagger: ProtectedActionOptions = {
  tag: 'Checklists',
  summary: 'Get all checklists for a note',
  additionalResponses: [
    {
      status: 200,
      description: 'List of checklists for the note.',
      type: [ChecklistResponseDto],
    },
    {
      status: 404,
      description: 'Note not found - The specified note does not exist.',
    },
    {
      status: 403,
      description:
        'Forbidden - User does not have permission to access this note.',
    },
  ],
};
