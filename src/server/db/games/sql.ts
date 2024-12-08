export const CREATE_GAME = `
INSERT INTO games (status)
VALUES ('pending')
RETURNING *, 1 as players
`;

export const ADD_PLAYER = `
INSERT INTO game_users (game_id, user_id, seat)
VALUES ($1, $2, (SELECT COUNT(*) FROM game_users WHERE game_id = $1) + 1)
RETURNING 
    game_id AS id, 
    (SELECT COUNT(*) FROM game_users WHERE game_id = $1) AS players,
    (SELECT player_count FROM games WHERE id = $1) AS player_count
`;

export const AVAILABLE_GAMES = `
SELECT *,
    (SELECT COUNT(*) FROM game_users WHERE games.id=game_users.game_id) AS players 
FROM games WHERE id IN 
    (SELECT game_id FROM game_users GROUP BY game_id HAVING COUNT(*) < 4)
LIMIT $1
OFFSET $2
`;

export const IS_USER_IN_GAME = `
SELECT 1 FROM game_users
WHERE game_id = $1 AND user_id = $2
`;

export const GET_GAME_INFO = `
SELECT g.id, COUNT(*) as players, g.player_count
FROM games g
LEFT JOIN game_users gu ON g.id = gu.game_id
WHERE g.id = $1
GROUP BY g.id
`;

export const GET_USER_GAMES = `
SELECT game_id FROM game_users WHERE user_id = $1
`