import React from 'react';
import Button from '@mui/material/Button';
import Add from '@mui/icons-material/Add';
import { useMemos } from '../../hooks/useMemos/useMemos';

type AddMemoButtonProps = {
  noteId: number;
};

export const AddMemoButton: React.FC<AddMemoButtonProps> = ({ noteId }) => {
  const { createMemo, isCreating } = useMemos(noteId);

  const handleAddMemo = async () => {
    await createMemo('');
  };

  return (
    <Button
      variant="outlined"
      startIcon={<Add />}
      onClick={handleAddMemo}
      disabled={isCreating}
      sx={{ mb: 2 }}
    >
      Add Memo
    </Button>
  );
};
