import db from "../connection";
import {ADD_PLAYER, AVAILABLE_GAMES, CREATE_GAME, IS_USER_IN_GAME, GET_GAME_INFO, GET_USER_GAMES} from "./sql";

type GameDescription = {
    id: number;
    players: number;
    player_count: number;
};

const create = async (playerId: number): Promise<GameDescription> => {
    const game = await db.one<GameDescription>(CREATE_GAME);

    await db.one(ADD_PLAYER, [game.id, playerId]);

    return game;
};

const join = async (playerId: number, gameId: number): Promise<GameDescription> => {
    return await db.one<GameDescription>(ADD_PLAYER, [gameId, playerId]);
}

const availableGames = async (limit: number = 20, offset: number = 0) => {
    return db.any(AVAILABLE_GAMES, [limit, offset]);
}

const isUserInGame = async (userId: number, gameId: number): Promise<boolean> => {
    const result = await db.oneOrNone(IS_USER_IN_GAME, [gameId, userId]);
    return !!result;
};

const getGameInfo = async (gameId: number) => {
    return db.one(GET_GAME_INFO, [gameId]);
};

const getUserGameRooms = async (userId: number) => {
    return db.any(GET_USER_GAMES, [userId]);
}
export default { create, join, availableGames, isUserInGame, getGameInfo, getUserGameRooms};