import { MemoResponseDto } from '../../../dtos/responses/memo.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const UpdateMemoSwagger: ProtectedActionOptions = {
  tag: 'Memos',
  summary: 'Update an existing memo',
  additionalResponses: [
    {
      status: 200,
      description: 'The memo has been successfully updated.',
      type: MemoResponseDto,
    },
    {
      status: 400,
      description: 'Bad request.',
    },
    {
      status: 404,
      description: 'Memo or note not found.',
    },
  ],
};
