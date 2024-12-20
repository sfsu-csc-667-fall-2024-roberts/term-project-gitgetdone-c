export type Card = {
    color: string | null;
    value: string;
};

export type Player = {
    id: number;
    username: string;
    hand: Card[];
};

export type GameState = {
    deck: Card[];
    discardPile: Card[];
    players: Player[];
    currentTurn: number;
    direction: number;
    chosenColor?: string | null;
    winnerId?: number | null;
    currentPlayerUsername?: string;
};
