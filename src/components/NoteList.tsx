import React from 'react';
import { useNotes } from '../hooks/useNotes';

interface NoteListProps {
  userId: string;
}

export const NoteList: React.FC<NoteListProps> = ({ userId }) => {
  const { notes, isLoading, error } = useNotes(userId);

  if (isLoading) {
    return <div className="note-list-loading">Loading notes...</div>;
  }

  if (error) {
    return <div className="note-list-error">{error}</div>;
  }

  if (notes.length === 0) {
    return <div className="note-list-empty">No notes found</div>;
  }

  return (
    <div className="note-list">
      <h2>Your Notes</h2>
      <ul>
        {notes.map((note, index) => (
          <li key={index} className={`note-list-item ${note.isMemo ? 'memo' : 'note'}`}>
            <div className="note-name">{note.name}</div>
            <div className="note-type">{note.isMemo ? 'Memo' : 'Note'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}; 