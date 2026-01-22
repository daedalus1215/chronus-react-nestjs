import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Note } from './note.entity';

@Entity('memos')
export class Memo {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'text' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'text' })
  updatedAt: string;

  @Column({ name: 'description', type: 'text', default: '' })
  description: string;

  @Column({ name: 'note_id' })
  noteId: number;

  @ManyToOne(() => Note, note => note.memos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'note_id' })
  note: Note;
}
