type CardColor = "red" | "blue" | "green" | "yellow";
type CardType = "number" | "skip" | "reverse" | "draw_two" | "wild" | "wild_draw_four";

interface Card {
    color: CardColor | null; // null for wild cards
    type: CardType;
    value: number | null; // null for non-number cards
}

interface Player {
    id: number;
    username: string;
    hand: Card[];
}

interface GameState {
    id: number;
    players: Player[];
    deck: Card[];
    discardPile: Card[];
    currentTurn: number;
    direction: 1 | -1; // 1 for clockwise, -1 for counterclockwise
}

export class UnoGame {
    private state: GameState;

    constructor(gameId: number, playerIds: number[]) {
        this.state = this.initializeGame(gameId, playerIds);
    }

    private initializeGame(gameId: number, playerIds: number[]): GameState {
        const deck = this.generateDeck();
        this.shuffleDeck(deck);

        const players = playerIds.map((id) => ({
            id,
            username: `Player ${id}`,
            hand: deck.splice(0, 7),
        }));

        return {
            id: gameId,
            players,
            deck,
            discardPile: [deck.pop()!],
            currentTurn: 0,
            direction: 1,
        };
    }

    public addPlayer(playerId: number): void {
        // Check if the player is already in the game
        if (this.state.players.some((player) => player.id === playerId)) {
            throw new Error("Player is already in the game.");
        }
    
        // Add the player to the game
        const newPlayer = {
            id: playerId,
            username: `Player ${playerId}`,
            hand: this.state.deck.splice(0, 7), // Deal 7 cards
        };
    
        this.state.players.push(newPlayer);
    }

    private generateDeck(): Card[] {
        const colors: CardColor[] = ["red", "blue", "green", "yellow"];
        const types: CardType[] = ["number", "skip", "reverse", "draw_two"];
        const deck: Card[] = [];

        for (const color of colors) {
            // Add number cards (0-9)
            for (let i = 0; i <= 9; i++) {
                deck.push({ color, type: "number", value: i });
                if (i !== 0) deck.push({ color, type: "number", value: i }); // Duplicate for 2 cards
            }

            // Add special cards (skip, reverse, draw two)
            for (const type of ["skip", "reverse", "draw_two"] as CardType[]) {
                deck.push({ color, type, value: null });
                deck.push({ color, type, value: null });
            }
        }

        // Add wild cards
        for (let i = 0; i < 4; i++) {
            deck.push({ color: null, type: "wild", value: null });
            deck.push({ color: null, type: "wild_draw_four", value: null });
        }

        return deck;
    }

    private shuffleDeck(deck: Card[]) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    public playCard(playerId: number, cardIndex: number): boolean {
        const player = this.state.players.find((p) => p.id === playerId);
        if (!player) throw new Error("Player not found");

        const card = player.hand[cardIndex];
        const topCard = this.state.discardPile[this.state.discardPile.length - 1];

        if (!this.isCardPlayable(card, topCard)) {
            return false; // Card is not playable
        }

        // Play the card
        player.hand.splice(cardIndex, 1);
        this.state.discardPile.push(card);
        this.applyCardEffect(card);

        // Move to the next turn
        this.state.currentTurn =
            (this.state.currentTurn + this.state.direction + this.state.players.length) %
            this.state.players.length;

        return true;
    }

    private isCardPlayable(card: Card, topCard: Card): boolean {
        return (
            card.color === topCard.color ||
            card.type === topCard.type ||
            card.type === "wild" ||
            card.type === "wild_draw_four"
        );
    }

    private applyCardEffect(card: Card) {
        if (card.type === "reverse") {
            this.state.direction *= -1;
        } else if (card.type === "skip") {
            this.state.currentTurn =
                (this.state.currentTurn + this.state.direction + this.state.players.length) %
                this.state.players.length;
        } else if (card.type === "draw_two") {
            const nextPlayer =
                (this.state.currentTurn + this.state.direction + this.state.players.length) %
                this.state.players.length;
            const cards = this.state.deck.splice(0, 2);
            this.state.players[nextPlayer].hand.push(...cards);
        } else if (card.type === "wild_draw_four") {
            const nextPlayer =
                (this.state.currentTurn + this.state.direction + this.state.players.length) %
                this.state.players.length;
            const cards = this.state.deck.splice(0, 4);
            this.state.players[nextPlayer].hand.push(...cards);
        }
    }

    public getState() {
        return this.state;
    }
}
