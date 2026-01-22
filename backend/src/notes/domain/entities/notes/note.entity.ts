import {
  Entity,
  Column,
  OneToMany,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Memo } from './memo.entity';

/**
 * Note entity decoupled from Tag entity.
 * CheckItems are accessed via CheckItemsAggregator, not through a direct relation.
 */
@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'text' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'text' })
  updatedAt: string;

  @OneToMany(() => Memo, memo => memo.note, {
    cascade: true,
  })
  memos?: Memo[] | null;

  @Column()
  name: string;

  @Column({ name: 'user_id' })
  userId: number;

  @DeleteDateColumn({ name: 'archived_at', nullable: true })
  archivedAt: Date | null;
}
