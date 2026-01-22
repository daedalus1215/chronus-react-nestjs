import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Memo } from '../../api/responses';
import {
  createMemo,
  updateMemo,
  deleteMemo,
} from '../../../../api/requests/memos.requests';

export const useMemos = (noteId: number) => {
  const queryClient = useQueryClient();

  const createMemoMutation = useMutation({
    mutationFn: (description: string) => createMemo(noteId, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
    },
  });

  const updateMemoMutation = useMutation({
    mutationFn: ({ id, description }: { id: number; description: string }) =>
      updateMemo(id, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
    },
  });

  const deleteMemoMutation = useMutation({
    mutationFn: (id: number) => deleteMemo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
    },
  });

  return {
    createMemo: createMemoMutation.mutateAsync,
    updateMemo: updateMemoMutation.mutateAsync,
    deleteMemo: deleteMemoMutation.mutateAsync,
    isCreating: createMemoMutation.isPending,
    isUpdating: updateMemoMutation.isPending,
    isDeleting: deleteMemoMutation.isPending,
    createError: createMemoMutation.error,
    updateError: updateMemoMutation.error,
    deleteError: deleteMemoMutation.error,
  };
};
