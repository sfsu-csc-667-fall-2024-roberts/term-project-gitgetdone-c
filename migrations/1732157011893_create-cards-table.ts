import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("cards", {
        id: "id",
        game_id: {
            type: "integer",
            references: "games",
            notNull: true,
            onDelete: "CASCADE",
        },
        card_value: {
            type: "varchar(20)",
            notNull: true,
        },
        position: {
            type: "varchar(50)",
            notNull: true,
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp"),
            notNull: true,
        },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("cards");
}
