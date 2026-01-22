import React from 'react';
import { Memo } from '../../api/responses';
import { MemoSection } from '../MemoSection/MemoSection';
import Box from '@mui/material/Box';
import { useIsMobile } from '../../../../hooks/useIsMobile';

type MemoListProps = {
  memos: Memo[];
  noteId: number;
  onAppendToDescription?: (appendFn: (text: string) => void) => void;
};

export const MemoList: React.FC<MemoListProps> = ({
  memos,
  noteId,
  onAppendToDescription,
}) => {
  const isMobile = useIsMobile();

  if (memos.length === 0) {
    return null;
  }

  // Only pass onAppendToDescription to the first memo
  // This ensures transcriptions go to the first memo
  const firstMemo = memos[0];
  const otherMemos = memos.slice(1);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 2,
        mb: 2,
      }}
    >
      <MemoSection
        key={firstMemo.id}
        memo={firstMemo}
        noteId={noteId}
        onAppendToDescription={onAppendToDescription}
      />
      {otherMemos.map(memo => (
        <MemoSection
          key={memo.id}
          memo={memo}
          noteId={noteId}
        />
      ))}
    </Box>
  );
};
