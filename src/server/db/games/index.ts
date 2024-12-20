import db from "../connection";
import {
    ADD_PLAYER,
    AVAILABLE_GAMES,
    CREATE_GAME,
    IS_USER_IN_GAME,
    GET_GAME_INFO,
    GET_USER_GAMES,
    FETCH_GAME_STATE,
    UPDATE_GAME_STATE,
    SET_GAME_FINISHED, GET_USERNAME
} from "./sql";
import {GameState, Player} from "../../../types/games";

type GameDescription = {
    id: number;
    players: number;
    player_count: number;
};

const create = async (playerId: number): Promise<GameDescription> => {
    const game = await db.one<GameDescription>(CREATE_GAME);
    const playerUsername = await db.one(GET_USERNAME, [playerId]).then(result => result.username);

    await db.one(ADD_PLAYER, [game.id, playerId]);

    const deck = shuffleDeck();
    const initialPlayer = { id: playerId, username: playerUsername, hand: deck.splice(0, 7) };

    let firstCardIndex = deck.findIndex(card => card.value !== "wild" && card.value !== "wild_draw4");

    if (firstCardIndex === -1) {
        throw new Error("Deck does not have any non-wild cards.");
    }

    const discardPile = [deck.splice(firstCardIndex, 1)[0]];

    const state: GameState = {
        deck,
        discardPile,
        players: [initialPlayer],
        currentTurn: 0,
        direction: 1,
        winnerId: null, // Initialize winnerId as null
    };
    

    await updateGameState(game.id, state);

    return {
        id: game.id,
        players: 1,
        player_count: game.player_count || 4,
    };
};

const shuffleDeck = (): Array<{ color: string | null; value: string }> => {
    const colors = ["red", "yellow", "green", "blue"];
    const values = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "reverse", "draw2"];
    const specials = ["wild", "wild_draw4"];

    let deck: { color: any; value: any; }[] = [];

    colors.forEach((color) => {
        values.forEach((value) => {
            deck.push({ color, value });
            if (value !== "0") deck.push({ color, value });
        });
    });

    specials.forEach((value) => {
        for (let i = 0; i < 4; i++) {
            deck.push({ color: null, value });
        }
    });

    return deck.sort(() => Math.random() - 0.5);
};

const join = async (playerId: number, gameId: number): Promise<GameDescription> => {
    const game = await db.one<GameDescription>(ADD_PLAYER, [gameId, playerId]);
    const playerUsername = await db.one(GET_USERNAME, [playerId]).then(result => result.username);
    const state = await getGameState(gameId);
    const existingPlayerIndex = state.players.findIndex(player => player.id === playerId);

    if (existingPlayerIndex !== -1) {
        state.players[existingPlayerIndex].hand = state.deck.splice(0, 7);
    } else {
        const newPlayer = { id: playerId, username: playerUsername, hand: state.deck.splice(0, 7) };
        state.players.push(newPlayer);
    }

    await updateGameState(gameId, state);

    return game;
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

const getGameState = async (gameId: number): Promise<GameState> => {
    const rows = await db.any(FETCH_GAME_STATE, [gameId]);
    console.log("Raw rows fetched from database:", rows);
    const { state } = rows[0];

    const players = rows.map(row => ({
        id: row.id,
        username: row.username,
        hand: state.players.find((player: Player) => player.id === row.id)?.hand || [],
    }));

    console.log("Reconstructed players:", players);

    const currentPlayer = players[state.currentTurn];
    console.log("Current players:", currentPlayer);

    return {
        ...state,
        players,
        currentPlayerUsername: currentPlayer?.username,
    } as GameState;
};

const updateGameState = async (gameId: number, state: object): Promise<object> => {
    const { state: updatedState } = await db.one(UPDATE_GAME_STATE, [gameId, state]);
    return updatedState;
};

const finishGame = async (gameId: number): Promise<void> => {
    await db.none(SET_GAME_FINISHED, [gameId]);
};

export default {
    create,
    join,
    availableGames,
    isUserInGame,
    getGameInfo,
    getUserGameRooms,
    getGameState,
    updateGameState,
    finishGame
};