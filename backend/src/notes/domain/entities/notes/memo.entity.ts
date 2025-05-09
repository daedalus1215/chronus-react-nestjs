import { Entity, Column, OneToOne } from "typeorm";
import { Note } from "./note.entity";
import { BaseEntity } from "../../../../shared-kernel/domain/entities/base.entity";

@Entity("memos")
export class Memo extends BaseEntity {
  @Column({ name: 'description', type: 'text', default: '' })
  description: string;

  @OneToOne(() => Note, (note) => note.id, { onDelete: "CASCADE" })
  note: Note;
}
