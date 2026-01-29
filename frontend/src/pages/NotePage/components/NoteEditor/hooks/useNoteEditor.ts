import React from 'react';
import {
  isValidTextForInsertion,
  insertTextAtCursorInTextarea,
  appendTextToEnd,
} from '../../../utils/textInsertion';

type Note = {
  id: number;
  name: string;
  description?: string;
  userId: string;
  isMemo: boolean;
  createdAt?: string;
};

type NoteContent = {
  description: string;
};

type UseNoteEditorProps = {
  note: Note;
  onSave: (note: Partial<Note>) => void;
};

type UseNoteEditorReturn = {
  content: NoteContent;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  appendToDescription: (text: string) => void;
};

export const useNoteEditor = ({
  note,
  onSave,
}: UseNoteEditorProps): UseNoteEditorReturn => {
  const [content, setContent] = React.useState<NoteContent>({
    description: note.description || '',
  });
  const timeoutRef = React.useRef<number>();
  const contentRef = React.useRef(content);
  const lastSyncedNoteDescriptionRef = React.useRef<string>(note.description || '');
  const noteIdRef = React.useRef<number>(note.id);
  const isInitialMountRef = React.useRef<boolean>(true);
  const isSyncingRef = React.useRef<boolean>(false);

  // Update contentRef when content changes
  React.useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Sync local state with note prop when note changes (e.g., after save or when switching modes)
  React.useEffect(() => {
    const currentNoteDescription = note.description || '';
    const lastSynced = lastSyncedNoteDescriptionRef.current;
    const localDescription = contentRef.current.description;
    const previousNoteId = noteIdRef.current;
    
    // If note ID changed, we're editing a different note - reset everything
    if (note.id !== previousNoteId) {
      isSyncingRef.current = true;
      setContent({ description: currentNoteDescription });
      lastSyncedNoteDescriptionRef.current = currentNoteDescription;
      noteIdRef.current = note.id;
      isInitialMountRef.current = false;
      isSyncingRef.current = false;
      return;
    }
    
    // On initial mount or remount, always sync with note prop
    // (any unsaved changes would have been saved on previous unmount)
    if (isInitialMountRef.current) {
      isSyncingRef.current = true;
      setContent({ description: currentNoteDescription });
      lastSyncedNoteDescriptionRef.current = currentNoteDescription;
      isInitialMountRef.current = false;
      isSyncingRef.current = false;
      return;
    }
    
    // Early return if already synced to prevent unnecessary work
    if (currentNoteDescription === lastSynced && localDescription === lastSynced) {
      return;
    }
    
    // If note description changed externally, check if we should sync
    if (currentNoteDescription !== lastSynced) {
      // Only sync if our local content matches what we last synced
      // This means the note was updated externally (e.g., after a save completed)
      // and we haven't made any new local changes since
      if (localDescription === lastSynced) {
        // Don't sync to empty if we have local content (prevents data loss from bad responses)
        if (currentNoteDescription || !localDescription) {
          // Only update if the value actually changed to prevent unnecessary re-renders
          if (currentNoteDescription !== localDescription) {
            isSyncingRef.current = true;
            setContent({ description: currentNoteDescription });
            isSyncingRef.current = false;
          }
          lastSyncedNoteDescriptionRef.current = currentNoteDescription;
        }
      } else {
        // If we have local changes that differ from what we last synced,
        // but the prop updated, it means our save completed.
        // Update lastSynced to the prop value to prevent future conflicts,
        // but don't overwrite local changes.
        // Only update if the prop value matches our local value (save succeeded)
        if (currentNoteDescription === localDescription) {
          lastSyncedNoteDescriptionRef.current = currentNoteDescription;
        }
      }
    }
  }, [note.id, note.description]);

  const noteRef = React.useRef(note);
  const onSaveRef = React.useRef(onSave);

  // Keep refs in sync
  React.useEffect(() => {
    noteRef.current = note;
    onSaveRef.current = onSave;
  }, [note, onSave]);

  const saveChanges = React.useCallback(() => {
    const currentContent = contentRef.current;
    const descriptionToSave = currentContent.description;
    onSaveRef.current({
      ...noteRef.current,
      description: descriptionToSave,
    });
    // Don't update lastSyncedRef here - wait for the prop to update after save completes
    // This prevents syncing to stale/empty values if the response is delayed or incorrect
  }, []); // No dependencies - use refs instead

  const debouncedSave = React.useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(saveChanges, 1000);
  }, [saveChanges]);

  const handleContentChange = React.useCallback(
    (updates: Partial<NoteContent>) => {
      // Don't trigger save if we're currently syncing (prevents infinite loops)
      if (isSyncingRef.current) {
        setContent(prev => ({ ...prev, ...updates }));
        return;
      }
      setContent(prev => ({ ...prev, ...updates }));
      debouncedSave();
    },
    [debouncedSave]
  );

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    handleContentChange({ description: e.target.value });
  };

  // Cleanup timeout on unmount and save immediately if there are pending changes
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      // Save immediately on unmount if there are unsaved changes
      const currentContent = contentRef.current;
      const lastSynced = lastSyncedNoteDescriptionRef.current;
      if (currentContent.description !== lastSynced) {
        // Flush any pending saves immediately
        saveChanges();
      }
      // Reset mount flag so next mount is treated as initial
      isInitialMountRef.current = true;
    };
  }, [saveChanges]);

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = document.getElementById(
      'note-description'
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content.description]);

  const handleContentChangeRef = React.useRef(handleContentChange);
  
  // Keep ref in sync
  React.useEffect(() => {
    handleContentChangeRef.current = handleContentChange;
  }, [handleContentChange]);

  const appendToDescription = React.useCallback(
    (text: string) => {
      console.log('appendToDescription called with:', text);
      
      // Validate text before processing
      if (!isValidTextForInsertion(text)) {
        console.debug('Skipping invalid text in appendToDescription:', text);
        return;
      }

      const currentDescription = contentRef.current.description || '';
      const TEXTAREA_ID = 'note-description';

      // Try to insert at cursor position (for speech-to-text at cursor location)
      const inserted = insertTextAtCursorInTextarea(
        TEXTAREA_ID,
        currentDescription,
        text,
        (newText) => {
          handleContentChangeRef.current({ description: newText });
        }
      );

      // Fallback to append behavior if textarea not found
      if (!inserted) {
        console.warn('Textarea not found, falling back to append behavior');
        const newDescription = appendTextToEnd(currentDescription, text);
        handleContentChangeRef.current({
          description: newDescription,
        });
      }
    },
    [] // No dependencies - use ref instead
  );

  return {
    content,
    handleDescriptionChange,
    appendToDescription,
  };
};
