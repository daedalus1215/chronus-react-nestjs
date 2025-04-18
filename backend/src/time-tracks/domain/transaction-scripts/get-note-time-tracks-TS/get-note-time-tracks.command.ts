export type GetNoteTimeTracksCommand = {
  noteId: number;
  user: {
    id: string;
    username: string;
  }
} 