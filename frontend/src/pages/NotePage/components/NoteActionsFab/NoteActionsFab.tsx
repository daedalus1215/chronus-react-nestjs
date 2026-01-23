import React, { useState, useEffect } from 'react';
import {
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Badge,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add,
  Mic,
  Stop,
  Note,
  Checklist,
} from '@mui/icons-material';
import { useMemos } from '../../hooks/useMemos/useMemos';
import { useCheckItems } from '../CheckListView/hooks/useCheckItems';
import { useAddCheckItemDialog } from '../CheckListView/hooks/useAddCheckItemDialog';
import { AddCheckItemDialog } from '../CheckListView/components/AddCheckItemDialog/AddCheckItemDialog';
import { useTranscriptionWebSocket } from '../../hooks/useTranscriptionWebSocket/useTranscriptionWebSocket';
import { useAudioRecorder } from '../../hooks/useAudioRecorder/useAudioRecorder';
import { Note as NoteType } from '../../api/responses';


type NoteActionsFabProps = {
  note: NoteType;
  onTranscription: (text: string) => void;
};

export const NoteActionsFab: React.FC<NoteActionsFabProps> = ({
  note,
  onTranscription,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);
  
  // Guard against undefined note - use safe defaults for hooks
  // All hooks must be called unconditionally to follow rules of hooks
  const noteId = note?.id ?? 0;
  const hasCheckItems = note?.checkItems && note.checkItems.length > 0;
  const [shouldFetchCheckItems, setShouldFetchCheckItems] = useState(hasCheckItems ?? false);
  
  const { createMemo, isCreating } = useMemos(noteId);
  
  // Update shouldFetchCheckItems when note gets check items
  useEffect(() => {
    if (hasCheckItems && !shouldFetchCheckItems) {
      setShouldFetchCheckItems(true);
    }
  }, [hasCheckItems, shouldFetchCheckItems]);
  
  // Call useCheckItems unconditionally - use a dummy note if note is undefined
  const dummyNote: NoteType = note ?? {
    id: 0,
    name: '',
    userId: '',
    createdAt: '',
    updatedAt: '',
    tags: [],
    memos: [],
  };
  const { addItem } = useCheckItems(dummyNote, shouldFetchCheckItems && !!note);
  const {
    isOpen: isAddCheckItemOpen,
    value: newCheckItemValue,
    openDialog: openAddCheckItemDialog,
    closeDialog: closeAddCheckItemDialog,
    changeValue: changeNewCheckItemValue,
    saveNew: saveNewCheckItem,
  } = useAddCheckItemDialog();

  // Transcription/Recording state
  const {
    isConnected,
    isRecording: isWsRecording,
    error: wsError,
    startRecording: startWs,
    stopRecording: stopWs,
    sendAudioChunk,
  } = useTranscriptionWebSocket({
    noteId: noteId,
    onTranscription,
    enabled: false,
  });

  const {
    isRecording: isAudioRecording,
    error: audioError,
    startRecording: startAudio,
    stopRecording: stopAudio,
    checkMicrophoneAvailability,
  } = useAudioRecorder({
    onAudioChunk: sendAudioChunk,
    enabled: true,
  });

  const isRecording = isWsRecording && isAudioRecording;
  const [isInitializing, setIsInitializing] = useState(false);
  const [micAvailable, setMicAvailable] = useState<boolean | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning'>(
    'error'
  );

  const error = wsError || audioError;

  useEffect(() => {
    const checkMic = async () => {
      const result = await checkMicrophoneAvailability();
      setMicAvailable(result.available);
      if (!result.available && result.error) {
        setSnackbarMessage(result.error);
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
      }
    };
    checkMic();
  }, [checkMicrophoneAvailability]);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [error]);

  const handleFabClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isRecording) {
      // If recording, stop it
      stopAudio();
      stopWs();
      setIsInitializing(false);
    } else {
      // Otherwise, open the menu
      setMenuAnchor(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAddMemo = async () => {
    handleMenuClose();
    if (!note || !note.id) return;
    await createMemo('');
  };

  const handleAddChecklist = () => {
    handleMenuClose();
    // Enable check items query when user wants to add a check item
    if (!shouldFetchCheckItems) {
      setShouldFetchCheckItems(true);
    }
    openAddCheckItemDialog();
  };

  const handleStartRecording = async () => {
    handleMenuClose();
    try {
      setIsInitializing(true);
      console.log('Starting WebSocket connection...');
      startWs();
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Starting audio recording...');
      await startAudio();
      setIsInitializing(false);
    } catch (err) {
      setIsInitializing(false);
      console.error('Failed to start recording:', err);
    }
  };

  const handleSaveCheckItem = async () => {
    if (!note || !note.id) return;
    await saveNewCheckItem(async (value: string) => {
      await addItem(value);
    });
  };

  // Don't render if note is not available
  if (!note || !note.id) {
    return null;
  }

  return (
    <>
      <Tooltip
        title={
          isRecording
            ? 'Stop recording'
            : isInitializing
            ? 'Initializing...'
            : 'Add memo, checklist, or record'
        }
        arrow
        placement="left"
      >
        <Fab
          color={isRecording ? 'error' : 'primary'}
          onClick={handleFabClick}
          disabled={isInitializing}
          aria-label={isRecording ? 'Stop recording' : 'Add or record'}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Badge
            badgeContent=" "
            color="error"
            invisible={!isRecording}
            sx={{
              '& .MuiBadge-badge': {
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              },
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 1,
                },
                '50%': {
                  opacity: 0.5,
                },
              },
            }}
          >
            {isInitializing ? (
              <CircularProgress size={24} color="inherit" />
            ) : isRecording ? (
              <Stop />
            ) : (
              <Add />
            )}
          </Badge>
        </Fab>
      </Tooltip>

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={handleStartRecording}
          disabled={micAvailable === false || isInitializing}
        >
          <ListItemIcon>
            <Mic fontSize="small" />
          </ListItemIcon>
          <ListItemText>Start Recording</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAddMemo} disabled={isCreating}>
          <ListItemIcon>
            <Note fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Memo</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAddChecklist}>
          <ListItemIcon>
            <Checklist fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Checklist Item</ListItemText>
        </MenuItem>
      </Menu>

      <AddCheckItemDialog
        isOpen={isAddCheckItemOpen}
        value={newCheckItemValue}
        onChange={changeNewCheckItemValue}
        onSave={handleSaveCheckItem}
        onClose={closeAddCheckItemDialog}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
