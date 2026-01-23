import React from 'react';
import { Memo } from '../../api/responses';
import { MemoSection } from '../MemoSection/MemoSection';
import Box from '@mui/material/Box';
import { useIsMobile } from '../../../../hooks/useIsMobile';

type MemoListProps = {
  memos: Memo[];
  noteId: number;
  onAppendToDescription?: (
    appendFn: (text: string) => void | null,
    memoId?: number
  ) => void;
  setFocusedMemo?: (memoId: number | null) => void;
};

export const MemoList: React.FC<MemoListProps> = ({
  memos,
  noteId,
  onAppendToDescription,
  setFocusedMemo,
}) => {
  const isMobile = useIsMobile();

  if (!memos || memos.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 2,
        mb: 2,
      }}
    >
      {memos.map(memo => (
        <MemoSection
          key={memo.id}
          memo={memo}
          noteId={noteId}
          onAppendToDescription={onAppendToDescription}
          setFocusedMemo={setFocusedMemo}
        />
      ))}
    </Box>
  );
};
