import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const DeleteChecklistSwagger: ProtectedActionOptions = {
  tag: 'Checklists',
  summary: 'Delete a checklist',
  additionalResponses: [
    {
      status: 200,
      description: 'The checklist has been successfully deleted.',
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
