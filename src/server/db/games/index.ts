import db from "../connection";
import {ADD_PLAYER, AVAILABLE_GAMES, CREATE_GAME} from "./sql";

const create = async (playerId: number) => {
    const game = await db.one<{id: number}>(CREATE_GAME);

    await db.none(ADD_PLAYER, [game.id, playerId]);

    return game.id;
};

const join = async (playerId: number, gameId: number, seat:number) => {
    await db.none(ADD_PLAYER, [gameId, playerId, seat]);
}

const availableGames = async (limit: number = 20, offset: number = 0) => {
    return db.any(AVAILABLE_GAMES, [limit, offset]);
}

export default {create, join, availableGames};