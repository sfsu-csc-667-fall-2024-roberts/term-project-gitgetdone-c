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
    players: Player[];
    currentTurn: number;
    direction: number;
    discardPile: Card[];
    deck: Card[];
    chosenColor?: string | null;
};
