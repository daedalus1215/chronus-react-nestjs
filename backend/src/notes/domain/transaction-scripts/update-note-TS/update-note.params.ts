export type UpdateNoteParams = {
  name?: string;
  tags?: { id: string; name: string; description: string }[];
};
