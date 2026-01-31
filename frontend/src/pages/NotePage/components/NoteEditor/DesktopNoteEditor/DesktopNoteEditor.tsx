import React from 'react';
import { useNoteEditor } from '../hooks/useNoteEditor';
import styles from './DesktopNoteEditor.module.css';

type Note = {
  id: number;
  name: string;
  description?: string;
  userId: string;
  isMemo: boolean;
  createdAt?: string;
};

type NoteEditorProps = {
  note: Note;
  onSave: (note: Partial<Note>) => void;
  onAppendToDescription?: (appendFn: (text: string) => void) => void;
};

export const DesktopNoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onAppendToDescription,
}) => {
  const { content, handleDescriptionChange, appendToDescription } =
    useNoteEditor({
      note,
      onSave,
    });

  // Track the last function we passed to prevent infinite loops
  const lastAppendToDescriptionRef = React.useRef<((text: string) => void) | null>(null);
  const onAppendToDescriptionRef = React.useRef(onAppendToDescription);

  // Keep ref in sync
  React.useEffect(() => {
    onAppendToDescriptionRef.current = onAppendToDescription;
  }, [onAppendToDescription]);

  // Set the callback only when it actually changes
  React.useEffect(() => {
    if (!onAppendToDescriptionRef.current || !appendToDescription) {
      return;
    }

    // Only update if the function reference actually changed
    if (lastAppendToDescriptionRef.current === appendToDescription) {
      return;
    }

    lastAppendToDescriptionRef.current = appendToDescription;
    
    // Use requestAnimationFrame to defer the state update and avoid React error #185
    // This ensures we're not updating state during render
    requestAnimationFrame(() => {
      if (onAppendToDescriptionRef.current) {
        onAppendToDescriptionRef.current(appendToDescription);
      }
    });
  }, [appendToDescription]);

  return (
    <div className={styles.editor}>
      <textarea
        id="note-description"
        value={content.description}
        onChange={handleDescriptionChange}
        className={styles.descriptionInput}
        placeholder="Start typing your note..."
        aria-label="Note description"
      />
    </div>
  );
};
