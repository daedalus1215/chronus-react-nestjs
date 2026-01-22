export type Note = {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tags: Array<{
    id: number;
    name: string;
  }>;
  checkItems?: Array<CheckItem>;
  memos: Array<Memo>;
};

export type Memo = {
  id: number;
  description: string;
  noteId: number;
  createdAt: string;
  updatedAt: string;
};

export type CheckItem = {
  id: number;
  name: string;
  doneDate: string;
  archiveDate: string;
  noteId: number;
  order: number;
};
