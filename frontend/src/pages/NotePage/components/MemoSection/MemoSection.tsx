import React, { useState } from 'react';
import { Memo } from '../../api/responses';
import { useMemos } from '../../hooks/useMemos/useMemos';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import VolumeUp from '@mui/icons-material/VolumeUp';
import Box from '@mui/material/Box';
import { useIsMobile } from '../../../../hooks/useIsMobile';
import { convertTextToSpeech } from '../../../../api/requests/audio.requests';

type MemoSectionProps = {
  memo: Memo;
  noteId: number;
  onAppendToDescription?: (appendFn: (text: string) => void) => void;
};

export const MemoSection: React.FC<MemoSectionProps> = ({
  memo,
  noteId,
  onAppendToDescription,
}) => {
  const isMobile = useIsMobile();
  const { updateMemo, deleteMemo, isUpdating, isDeleting } = useMemos(noteId);
  const [description, setDescription] = useState(memo.description);
  const [isConverting, setIsConverting] = useState(false);
  const timeoutRef = React.useRef<number>();

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newDescription = e.target.value;
    setDescription(newDescription);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      updateMemo({ id: memo.id, description: newDescription });
    }, 1000);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this memo?')) {
      await deleteMemo(memo.id);
    }
  };

  const handleTextToSpeech = async () => {
    try {
      setIsConverting(true);
      await convertTextToSpeech(noteId, memo.id);
    } catch (err) {
      console.error('Error converting text to speech:', err);
      alert('Failed to convert text to speech');
    } finally {
      setIsConverting(false);
    }
  };

  const appendToDescription = React.useCallback(
    (text: string) => {
      if (
        !text ||
        typeof text !== 'string' ||
        text.trim() === '' ||
        text === 'undefined' ||
        text === 'null'
      ) {
        return;
      }

      const currentDescription = description || '';
      const separator = currentDescription ? ' ' : '';
      const newDescription = `${currentDescription}${separator}${text.trim()}`;
      setDescription(newDescription);
      updateMemo({ id: memo.id, description: newDescription });
    },
    [description, memo.id, updateMemo]
  );

  React.useEffect(() => {
    if (onAppendToDescription) {
      onAppendToDescription(appendToDescription);
    }
  }, [onAppendToDescription, appendToDescription]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const textarea = document.getElementById(
      `memo-description-${memo.id}`
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [description, memo.id]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>Memo</Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={handleTextToSpeech}
            disabled={isConverting || !description.trim()}
            aria-label="Convert to speech"
            title="Convert memo to speech"
          >
            <VolumeUp fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete memo"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <TextField
        id={`memo-description-${memo.id}`}
        value={description}
        onChange={handleDescriptionChange}
        multiline
        fullWidth
        placeholder="Start typing your memo..."
        variant="outlined"
        disabled={isUpdating}
        minRows={3}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: isMobile ? '0.875rem' : '1rem',
          },
        }}
      />
    </Box>
  );
};
