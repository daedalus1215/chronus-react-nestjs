import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_ChangeMemoToManyToManyRelationship1769044390000
  implements MigrationInterface
{
  name = 'Alter_ChangeMemoToManyToManyRelationship1769044390000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add note_id column to memos table
    await queryRunner.query(
      `ALTER TABLE "memos" ADD COLUMN "note_id" integer`
    );

    // Step 2: Migrate existing data - update memos with note_id from notes table
    await queryRunner.query(
      `UPDATE "memos" SET "note_id" = (SELECT "id" FROM "notes" WHERE "notes"."memo_id" = "memos"."id") WHERE EXISTS (SELECT 1 FROM "notes" WHERE "notes"."memo_id" = "memos"."id")`
    );

    // Step 3: Create temporary notes table without memo_id
    await queryRunner.query(
      `CREATE TABLE "temporary_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "user_id" integer NOT NULL, "archived_at" datetime, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')))`
    );

    // Step 4: Copy data from notes to temporary_notes (excluding memo_id)
    await queryRunner.query(
      `INSERT INTO "temporary_notes"("id", "name", "user_id", "archived_at", "created_at", "updated_at") SELECT "id", "name", "user_id", "archived_at", "created_at", "updated_at" FROM "notes"`
    );

    // Step 5: Drop old notes table
    await queryRunner.query(`DROP TABLE "notes"`);

    // Step 6: Rename temporary_notes to notes
    await queryRunner.query(`ALTER TABLE "temporary_notes" RENAME TO "notes"`);

    // Step 7: Add foreign key constraint to memos.note_id
    // Note: SQLite doesn't support adding foreign key constraints to existing tables
    // The constraint will be enforced by TypeORM when creating new memos
    await queryRunner.query(
      `CREATE INDEX "IDX_memos_note_id" ON "memos" ("note_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Remove foreign key index from memos
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_memos_note_id"`);

    // Step 2: Create temporary notes table with memo_id
    await queryRunner.query(
      `CREATE TABLE "temporary_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "user_id" integer NOT NULL, "memo_id" integer, "archived_at" datetime, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_571a925e7a956c24701f01af899" UNIQUE ("memo_id"), CONSTRAINT "FK_2d85c0c4df4bdc951cdd0f94650" FOREIGN KEY ("memo_id") REFERENCES "memos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`
    );

    // Step 3: Migrate data back - set memo_id to first memo for each note
    await queryRunner.query(
      `INSERT INTO "temporary_notes"("id", "name", "user_id", "memo_id", "archived_at", "created_at", "updated_at") 
       SELECT "n"."id", "n"."name", "n"."user_id", 
              (SELECT "m"."id" FROM "memos" "m" WHERE "m"."note_id" = "n"."id" LIMIT 1) as "memo_id",
              "n"."archived_at", "n"."created_at", "n"."updated_at" 
       FROM "notes" "n"`
    );

    // Step 4: Drop current notes table
    await queryRunner.query(`DROP TABLE "notes"`);

    // Step 5: Rename temporary_notes to notes
    await queryRunner.query(`ALTER TABLE "temporary_notes" RENAME TO "notes"`);

    // Step 6: Remove note_id column from memos
    await queryRunner.query(`ALTER TABLE "memos" DROP COLUMN "note_id"`);
  }
}
