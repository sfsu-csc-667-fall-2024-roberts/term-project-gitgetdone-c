import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("users", {
        id: "id",
        username: {
            type: "varchar(50)",
            notNull: true,
        },
        email: {
            type: "varchar(254)",
            unique: true,
            notNull: true,
        },
        gravatar: {
            type: "varchar(100)",
            notNull: true,
        },
        password: {
            type: "varchar(100)",
            notNull: true,
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        updated_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("users");
}
