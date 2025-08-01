import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CheckItem } from "./domain/entities/check-item.entity";
import { CheckItemsRepository } from "./infra/repositories/check-items/check-items.repository";
import { CreateCheckItemAction } from "./apps/actions/create-check-item/create-check-item.action";
import { GetCheckItemAction } from "./apps/actions/get-check-item/get-check-item.action";
import { ToggleCheckItemAction } from "./apps/actions/toggle-check-item/toggle-check-item.action";
import { DeleteCheckItemAction } from "./apps/actions/delete-check-item/delete-check-item.action";
import { UpdateCheckItemAction } from "./apps/actions/update-check-item/update-check-item.action";
import { GetCheckItemsByNoteAction } from "./apps/actions/get-check-items-by-note/get-check-items-by-note.action";
import { CreateCheckItemTransactionScript } from "./domain/transaction-scripts/create-check-item/create-check-item.transaction.script";
import { GetCheckItemTransactionScript } from "./domain/transaction-scripts/get-check-item/get-check-item.transaction.script";
import { ToggleCheckItemTransactionScript } from "./domain/transaction-scripts/toggle-check-item/toggle-check-item.transaction.script";
import { DeleteCheckItemTransactionScript } from "./domain/transaction-scripts/delete-check-item/delete-check-item.transaction.script";
import { UpdateCheckItemTransactionScript } from "./domain/transaction-scripts/update-check-item/update-check-item.transaction.script";
import { GetCheckItemsByNoteTransactionScript } from "./domain/transaction-scripts/get-check-items-by-note/get-check-items-by-note.transaction.script";
import { CheckItemService } from "./domain/services/check-item.service";
import { NotesModule } from "../notes/notes.module";
import { CheckItemsHydrator } from './infra/repositories/check-items/check-items.hydrator';  

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckItem]),
    NotesModule, // Import to access NoteAggregator
  ],
  providers: [
    CheckItemsRepository,
    CheckItemsHydrator,
    CreateCheckItemTransactionScript,
    GetCheckItemTransactionScript,
    ToggleCheckItemTransactionScript,
    DeleteCheckItemTransactionScript,
    UpdateCheckItemTransactionScript,
    GetCheckItemsByNoteTransactionScript,
    CheckItemService,
  ],
  controllers: [
    CreateCheckItemAction,
    GetCheckItemAction,
    ToggleCheckItemAction,
    DeleteCheckItemAction,
    UpdateCheckItemAction,
    GetCheckItemsByNoteAction,
  ],
  exports: [CheckItemsRepository, CheckItemService],
})
export class CheckItemsModule {} 