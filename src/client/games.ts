document
    .querySelector<HTMLFormElement>("#blarg")!
    .addEventListener("submit", (event) => {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        fetch(form.action, {method:"post"});
    });

window.socket.on("thing", (thing) => {
    console.log("Thing", thing);
});