/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/client/lobby.ts":
/*!*****************************!*\
  !*** ./src/client/lobby.ts ***!
  \*****************************/
/***/ (() => {

eval("\nconst list = document.querySelector(\"#available-games-list\");\nconst rowTemplate = document.querySelector(\"#game-row-template\");\nwindow.socket.on(\"game-created\", (game) => {\n    console.log(\"Game created\", { game });\n    const row = rowTemplate.content.cloneNode(true);\n    const tr = row.querySelector(\"tr\");\n    tr.id = `game-row-${game.id}`;\n    tr.querySelector(\"td:nth-child(1)\").textContent = `Game ${game.id}`;\n    tr.querySelector(\"td:nth-child(2)\").textContent =\n        `(${game.players} / ${game.player_count})`;\n    tr.querySelector(\"td:nth-child(3) form\").action =\n        `/games/join/${game.id}`;\n    list.appendChild(row);\n});\nwindow.socket.on(\"game-updated\", (game) => {\n    const row = document.querySelector(`#game-row-${game.id}`);\n    if (row) {\n        row.querySelector(\"td:nth-child(2)\").textContent = `${game.players} / ${game.player_count}`;\n    }\n});\n\n\n//# sourceURL=webpack://uno-project/./src/client/lobby.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/client/lobby.ts"]();
/******/ 	
/******/ })()
;