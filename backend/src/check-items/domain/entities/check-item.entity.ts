import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Checklist } from './checklist.entity';

@Entity('check_items')
export class CheckItem {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column()
  name: string;

  @Column({ name: 'done_date', nullable: true })
  doneDate: Date | null;

  @Column({ name: 'archived_date', nullable: true })
  archiveDate: Date | null;

  @Column({ name: 'note_id' })
  @JoinColumn({ name: 'note_id' })
  noteId: number;

  @Column({ name: 'checklist_id', nullable: true })
  checklistId: number | null;

  @ManyToOne(() => Checklist, checklist => checklist.checkItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'checklist_id' })
  checklist: Checklist | null;

  @Column({ name: 'order', type: 'integer', default: 0 })
  order: number;
}
