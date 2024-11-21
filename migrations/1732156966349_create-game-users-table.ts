import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("game_users", {
        game_id: {
            type: "integer",
            notNull: true,
            references: "games(id)",
            onDelete: "CASCADE",
        },
        user_id: {
            type: "integer",
            notNull: true,
            references: "users(id)",
            onDelete: "CASCADE",
        },
        seat:  {
            type: "integer",
            notNull: true,
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp"),
            notNull: true,
        },
    });

    pgm.addConstraint(
        "game_users",
        "game_users_pk",
        {
            primaryKey: ["game_id", "user_id"],
        }
    );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("game_users");
}
