import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const DeleteMemoSwagger: ProtectedActionOptions = {
  tag: 'Memos',
  summary: 'Delete a memo',
  additionalResponses: [
    {
      status: 200,
      description: 'The memo has been successfully deleted.',
    },
    {
      status: 404,
      description: 'Memo or note not found.',
    },
  ],
};
