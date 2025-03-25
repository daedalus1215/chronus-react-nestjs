import React from 'react';
import styles from './NoteItem.module.css';

type Note = {
  name: string;
  userId: string;
  isMemo: boolean;
  createdAt?: string;
}

type NoteItemProps = {
  note: Note;
}

export const NoteItem:React.FC<NoteItemProps> = ({ note }) => {
  const timeAgo = note.createdAt ? '39m' : ''; // This should be calculated from note.createdAt

  return (
    <div className={`${styles.noteListItem} ${note.isMemo ? styles.memo : styles.note}`}>
      <div>
        <div className={styles.noteName}>{note.name}</div>
        <div className={styles.noteTime}>{timeAgo}</div>
      </div>
      <div className={styles.noteActions}>
        <div className={styles.noteType}>
          {note.isMemo ? 'Memo' : 'Note'}
        </div>
        <button className={styles.actionButton} aria-label="More options">
          •••
        </button>
      </div>
    </div>
  );
}
