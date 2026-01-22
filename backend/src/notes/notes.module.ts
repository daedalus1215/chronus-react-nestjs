import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Note } from './domain/entities/notes/note.entity';
import { Memo } from './domain/entities/notes/memo.entity';
import { NoteMemoTagRepository } from './infra/repositories/note-memo-tag.repository';
import { GetNoteNamesByUserIdAction } from './apps/actions/notes/get-note-names-by-userId/get-note-names-by-userId.action';
import { CreateNoteAction } from './apps/actions/notes/create-note-action/create-note.action';
import { CreateNoteTransactionScript } from './domain/transaction-scripts/create-note.transaction.script';
import { GetNoteByIdAction } from './apps/actions/notes/get-note-by-id-action/get-note-by-id.action';
import { GetNoteByIdTransactionScript } from './domain/transaction-scripts/get-note-by-id.transaction.script';
import { UpdateNoteAction } from './apps/actions/notes/update-note-action/update-note.action';
import { UpdateNoteTransactionScript } from './domain/transaction-scripts/update-note-TS/update-note.transaction.script';
import { UpdateNoteParamsToEntityConverter } from './domain/transaction-scripts/update-note-TS/update-note-params-to-entity.converter';
import { NoteAggregator } from './domain/aggregators/note.aggregator';
import { UpdateNoteTimestampAction } from './apps/actions/update-note-timestamp.action';
import { UpdateNoteTitleAction } from './apps/actions/notes/update-note-title-action/update-note-title.action';
import { UpdateNoteTitleTransactionScript } from './domain/transaction-scripts/update-note-title.transaction.script';
import { DeleteNoteAction } from './apps/actions/notes/delete-note.action';
import { ArchiveNoteAction } from './apps/actions/archive-note/archive-note.action';
import { ArchiveNoteTransactionScript } from './domain/transaction-scripts/archive-note/archive-note.transaction.script';
import { NoteService } from './domain/services/note.service';
import { GetNoteNamesByIdsTransactionScript } from './domain/transaction-scripts/get-note-names-by-ids.transaction.script';
import { VerifyNoteAccessListener } from './apps/listeners/verify-note-access.listener';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GetNoteDetailsListener } from './apps/listeners/get-note-details.listener';
import { CheckItemsModule } from '../check-items/check-items.module';
import { GetNoteByIdResponder } from './apps/actions/notes/get-note-by-id-action/get-note-by-id.responder';
import { UpdateNoteResponder } from './apps/actions/notes/update-note-action/update-note.responder';
import { MemoRepository } from './infra/repositories/memo.repository';
import { CreateMemoTransactionScript } from './domain/transaction-scripts/create-memo-TS/create-memo.transaction.script';
import { UpdateMemoTransactionScript } from './domain/transaction-scripts/update-memo-TS/update-memo.transaction.script';
import { DeleteMemoTransactionScript } from './domain/transaction-scripts/delete-memo-TS/delete-memo.transaction.script';
import { GetMemosByNoteIdTransactionScript } from './domain/transaction-scripts/get-memos-by-note-id-TS/get-memos-by-note-id.transaction.script';
import { CreateMemoAction } from './apps/actions/memos/create-memo-action/create-memo.action';
import { UpdateMemoAction } from './apps/actions/memos/update-memo-action/update-memo.action';
import { DeleteMemoAction } from './apps/actions/memos/delete-memo-action/delete-memo.action';
import { GetMemosByNoteIdAction } from './apps/actions/memos/get-memos-by-note-id-action/get-memos-by-note-id.action';
import { CreateMemoResponder } from './apps/actions/memos/create-memo-action/create-memo.responder';
import { UpdateMemoResponder } from './apps/actions/memos/update-memo-action/update-memo.responder';
import { GetMemosByNoteIdResponder } from './apps/actions/memos/get-memos-by-note-id-action/get-memo-by-note-id.responder';

@Module({
  imports: [
    TypeOrmModule.forFeature([Note, Memo]),
    EventEmitterModule.forRoot(),
    AuthModule,
    CheckItemsModule,
  ],
  providers: [
    NoteMemoTagRepository,
    MemoRepository,
    NoteAggregator,
    CreateNoteTransactionScript,
    GetNoteByIdTransactionScript,
    UpdateNoteTransactionScript,
    UpdateNoteTitleTransactionScript,
    ArchiveNoteTransactionScript,
    UpdateNoteParamsToEntityConverter,
    NoteService,
    GetNoteNamesByIdsTransactionScript,
    VerifyNoteAccessListener,
    GetNoteDetailsListener,
    GetNoteByIdResponder,
    UpdateNoteResponder,
    CreateMemoResponder,
    UpdateMemoResponder,
    GetMemosByNoteIdResponder,
    CreateMemoTransactionScript,
    UpdateMemoTransactionScript,
    DeleteMemoTransactionScript,
    GetMemosByNoteIdTransactionScript,
  ],
  controllers: [
    GetNoteNamesByUserIdAction,
    CreateNoteAction,
    GetNoteByIdAction,
    UpdateNoteAction,
    UpdateNoteTimestampAction,
    UpdateNoteTitleAction,
    DeleteNoteAction,
    ArchiveNoteAction,
    CreateMemoAction,
    UpdateMemoAction,
    DeleteMemoAction,
    GetMemosByNoteIdAction,
  ],
  exports: [NoteMemoTagRepository, NoteAggregator, NoteService],
})
export class NotesModule {}
