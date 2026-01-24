import { ChecklistResponseDto } from '../../dtos/responses/checklist.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const UpdateChecklistSwagger: ProtectedActionOptions = {
  tag: 'Checklists',
  summary: 'Update a checklist',
  additionalResponses: [
    {
      status: 200,
      description: 'The checklist has been successfully updated.',
      type: ChecklistResponseDto,
    },
    {
      status: 400,
      description: 'Bad request - Invalid input data.',
    },
    {
      status: 404,
      description: 'Checklist not found - The specified checklist does not exist.',
    },
    {
      status: 403,
      description:
        'Forbidden - User does not have permission to access this checklist.',
    },
  ],
};
