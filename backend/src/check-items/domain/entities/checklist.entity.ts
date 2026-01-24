import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Note } from 'src/notes/domain/entities/notes/note.entity';
import { CheckItem } from './check-item.entity';

@Entity('checklists')
export class Checklist {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'text' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'text' })
  updatedAt: string;

  @Column({ name: 'note_id' })
  noteId: number;

  @ManyToOne(() => Note, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'note_id' })
  note: Note;

  @Column({ name: 'name', type: 'text', nullable: true })
  name: string | null;

  @Column({ name: 'column', type: 'text', default: 'left' })
  column: 'left' | 'right';

  @Column({ name: 'order', type: 'integer', default: 0 })
  order: number;

  @OneToMany(() => CheckItem, checkItem => checkItem.checklist, {
    cascade: true,
  })
  checkItems?: CheckItem[] | null;
}
