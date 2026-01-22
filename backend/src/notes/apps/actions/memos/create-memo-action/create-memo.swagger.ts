import { MemoResponseDto } from '../../../dtos/responses/memo.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const CreateMemoSwagger: ProtectedActionOptions = {
  tag: 'Memos',
  summary: 'Create a new memo',
  additionalResponses: [
    {
      status: 201,
      description: 'The memo has been successfully created.',
      type: MemoResponseDto,
    },
    {
      status: 400,
      description: 'Bad request.',
    },
    {
      status: 404,
      description: 'Note not found.',
    },
  ],
};
