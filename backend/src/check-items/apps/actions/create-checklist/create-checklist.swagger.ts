import { ChecklistResponseDto } from '../../dtos/responses/checklist.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const CreateChecklistSwagger: ProtectedActionOptions = {
  tag: 'Checklists',
  summary: 'Create a new checklist for a note',
  additionalResponses: [
    {
      status: 201,
      description: 'The checklist has been successfully created.',
      type: ChecklistResponseDto,
    },
    {
      status: 400,
      description: 'Bad request - Invalid input data.',
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
