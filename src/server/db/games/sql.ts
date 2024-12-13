export const CREATE_GAME = `
    INSERT INTO games (status, state)
    VALUES (
        'pending',
        '{"players": [], "deck": [], "discardPile": [], "currentTurn": 0, "direction": 1}'::jsonb
           )
    RETURNING *;
`;

export const ADD_PLAYER = `
INSERT INTO game_users (game_id, user_id, seat, username)
VALUES ($1, $2, (SELECT COUNT(*) FROM game_users WHERE game_id = $1) + 1,
        (SELECT username FROM users WHERE id = $2))
RETURNING 
    game_id AS id, 
    (SELECT COUNT(*) FROM game_users WHERE game_id = $1) AS players,
    (SELECT player_count FROM games WHERE id = $1) AS player_count,
    username;
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

export const UPDATE_GAME_STATE = `
UPDATE games
SET state = $2
WHERE id = $1
RETURNING state;
`;

export const FETCH_GAME_STATE = `
SELECT g.state, gu.user_id AS id, gu.username
FROM games g
JOIN game_users gu ON g.id = gu.game_id
WHERE g.id = $1;
`;

export const SET_GAME_FINISHED = `
UPDATE games
SET status = 'finished'
WHERE id = $1;
`;

export const GET_USERNAME = `
SELECT username 
FROM users 
WHERE id = $1;
`;