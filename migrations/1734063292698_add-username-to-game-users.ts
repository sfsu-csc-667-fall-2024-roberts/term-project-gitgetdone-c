import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumn('game_users', {
        username: {
            type: 'varchar(255)',
            notNull: false,
        },
    });

    pgm.sql(`
        UPDATE game_users
        SET username = (
            SELECT username 
            FROM users 
            WHERE users.id = game_users.user_id
        );
    `);

    pgm.alterColumn('game_users', 'username', {
        notNull: true,
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumn('game_users', 'username');
}
