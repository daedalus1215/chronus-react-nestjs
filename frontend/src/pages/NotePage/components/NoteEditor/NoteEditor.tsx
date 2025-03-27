import React from 'react';
import styles from './NoteEditor.module.css';

type Note = {
  id: number;
  name: string;
  description?: string;
  userId: string;
  isMemo: boolean;
  createdAt?: string;
}

type NoteEditorProps = {
  note: Note;
  onSave: (note: Partial<Note>) => void;
  isLoading?: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ 
  note, 
  onSave,
  isLoading = false 
}) => {
  const [title, setTitle] = React.useState(note.name);
  const [description, setDescription] = React.useState(note.description || '');
  const [isDirty, setIsDirty] = React.useState(false);
  const saveTimeoutRef = React.useRef<number>();
  const lastSavedRef = React.useRef<{title: string; description: string}>({
    title: note.name,
    description: note.description || ''
  });

  const triggerSave = React.useCallback(() => {
    if (!isDirty) return;
    
    const currentContent = { title, description };
    const lastSaved = lastSavedRef.current;
    
    // Only save if content has actually changed
    if (lastSaved.title === currentContent.title && 
        lastSaved.description === currentContent.description) {
      return;
    }

    onSave({
      ...note,
      name: title,
      description
    });
    
    lastSavedRef.current = currentContent;
    setIsDirty(false);
  }, [title, description, isDirty, note, onSave]);

  const debouncedSave = React.useCallback(() => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = window.setTimeout(triggerSave, 2000);
  }, [triggerSave]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsDirty(true);
    debouncedSave();
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setIsDirty(true);
    debouncedSave();
  };

  // Manual save button handler
  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    triggerSave();
  };

  // Save on unmount if there are pending changes
  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      if (isDirty) {
        triggerSave();
      }
    };
  }, [isDirty, triggerSave]);

  // Auto-resize textarea as content grows
  React.useEffect(() => {
    const textarea = document.getElementById('note-description') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [description]);

  return (
    <div className={styles.editor}>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        className={styles.titleInput}
        placeholder="Note title"
        aria-label="Note title"
      />
      <textarea
        id="note-description"
        value={description}
        onChange={handleDescriptionChange}
        className={styles.descriptionInput}
        placeholder="Start typing your note..."
        aria-label="Note description"
      />
      {isDirty && (
        <button 
          className={styles.saveButton}
          onClick={handleManualSave}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save changes'}
        </button>
      )}
    </div>
  );
}; 