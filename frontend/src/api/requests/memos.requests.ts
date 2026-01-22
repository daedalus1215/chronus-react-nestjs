import api from '../axios.interceptor';
import { Memo } from '../../pages/NotePage/api/responses';

export const createMemo = async (
  noteId: number,
  description: string
): Promise<Memo> => {
  const response = await api.post<Memo>('/memos', {
    noteId,
    description,
  });
  return response.data;
};

export const updateMemo = async (
  id: number,
  description: string
): Promise<Memo> => {
  const response = await api.put<Memo>('/memos', {
    id,
    description,
  });
  return response.data;
};

export const deleteMemo = async (id: number): Promise<void> => {
  await api.delete(`/memos/${id}`);
};

export const getMemosByNoteId = async (noteId: number): Promise<Memo[]> => {
  const response = await api.get<Memo[]>(`/memos/notes/${noteId}`);
  return response.data;
};
