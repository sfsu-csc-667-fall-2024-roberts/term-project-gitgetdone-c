const list = document.querySelector<HTMLTableSectionElement>(
    "#available-games-list")!;
const rowTemplate =
    document.querySelector<HTMLTemplateElement>("#game-row-template")!;

window.socket.on("game-created", (game) => {
    console.log("Game created", {game});
    const row = rowTemplate.content.cloneNode(true) as HTMLTableRowElement;
    const tr = row.querySelector("tr")!;
    tr.id = `game-row-${game.id}`;
    tr.querySelector("td:nth-child(1)")!.textContent = `Game ${game.id}`;
    tr.querySelector("td:nth-child(2)")!.textContent =
        `(${game.players} / ${game.player_count})`;
    tr.querySelector<HTMLFormElement>("td:nth-child(3) form")!.action =
        `/games/join/${game.id}`;

    list.appendChild(row);
});

window.socket.on("game-updated", (game) => {
    const row = document.querySelector(`#game-row-${game.id}`);
    if (row) {
        row.querySelector("td:nth-child(2)")!.textContent = `${game.players} / ${game.player_count}`;
    }
});