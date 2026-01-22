import { MemoResponseDto } from '../../../dtos/responses/memo.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const GetMemosByNoteIdSwagger: ProtectedActionOptions = {
  tag: 'Memos',
  summary: 'Get all memos for a note',
  additionalResponses: [
    {
      status: 200,
      description: 'List of memos for the note.',
      type: [MemoResponseDto],
    },
    {
      status: 404,
      description: 'Note not found.',
    },
  ],
};
