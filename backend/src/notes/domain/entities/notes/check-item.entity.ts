import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { BaseEntity } from "src/shared-kernel/domain/entities/base.entity";
import { Note } from "./note.entity";

@Entity("check_items")
export class CheckItem extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: "done_date" })
  doneDate: Date;

  @Column({ name: "archive_date" })
  archiveDate: Date;

  @JoinColumn({ name: "note_id" })
  noteId: number;

  @ManyToOne(() => Note, (note) => note.checkItems, { onDelete: "CASCADE" })
  note: Note;
}
