import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Tag } from '../../../domain/entities/tag.entity';
import { TagNote } from '../../../../shared-kernel/domain/entities/tag-note.entity';
import { TagWithCount } from 'src/tags/domain/transaction-scripts/get-tags-by-user-id.transaction.script';
import { tagsByUserIdHydrator } from './hydrators/tags-by-user-id-hydrator';

@Injectable()
export class TagRepository {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(TagNote)
    private readonly tagNoteRepository: Repository<TagNote>
  ) {}

  async findTagByName(name: string, userId: number): Promise<Tag | null> {
    return this.tagRepository.findOne({ where: { name, userId } });
  }

  async findTagByIdAndUserId(id: string, userId: number): Promise<Tag | null> {
    return this.tagRepository.findOne({ where: { id, userId } });
  }

  async createTag(tagData: Partial<Tag>): Promise<Tag> {
    const tag = this.tagRepository.create(tagData);
    return this.tagRepository.save(tag);
  }

  async removeTag(tag: Tag): Promise<Tag> {
    return this.tagRepository.remove(tag);
  }
  
  async getTagsByUserId(userId: number): Promise<TagWithCount[]> {
    return await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('tag_notes', 'tag_note', 'tag_note.tag_id = tag.id')
      .where('tag.user_id = :userId', { userId })
      .andWhere('tag_note.archived_date IS NULL')  // Only count non-archived associations
      .select([
        'tag.id',
        'tag.name',
        'COUNT(tag_note.id) as "noteCount"'
      ])
      .groupBy('tag.id')
      .getRawMany()
      .then(tagsByUserIdHydrator);
  }

  async addTagToNote(noteId: number, tagId: string): Promise<TagNote> {
    const tagNote = this.tagNoteRepository.create({ notes: { id: noteId }, tag: { id: tagId } });
    return this.tagNoteRepository.save(tagNote);
  }

  async findTagsByNoteId(noteId: number): Promise<Tag[]> {
    const tagNotes = await this.tagNoteRepository.find({ where: { notes: { id: noteId } } });
    const tagIds = tagNotes.map(tn => tn.tagId);
    if (!tagIds.length) return [];
    return this.tagRepository.find({ where: { id: In(tagIds) } });
  }
} 