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

/***/ "./src/client/chat.ts":
/*!****************************!*\
  !*** ./src/client/chat.ts ***!
  \****************************/
/***/ (() => {

eval("\nconst form = document.querySelector('#chat-section form');\nconst input = document.querySelector('input#chat-message');\nconst messageTemplate = document.querySelector('#chat-message-template');\ninput.addEventListener('keydown', keyDownEvent => {\n    if (keyDownEvent.key === 'Enter') {\n        form.dispatchEvent(new CustomEvent('submit'));\n    }\n});\nform.addEventListener('submit', (e) => {\n    e.preventDefault();\n    const message = input.value;\n    input.value = '';\n    fetch(form.action, {\n        method: 'POST',\n        headers: { \"Content-Type\": \"application/json\" },\n        body: JSON.stringify({ message })\n    }).then(response => {\n        if (response.status !== 200) {\n            console.error('Error:', response);\n        }\n    });\n});\n// IIFE\n//(() => {\nwindow.socket.on(`message:${window.roomId}`, (payload) => {\n    const messageElement = messageTemplate.content.cloneNode(true);\n    messageElement.querySelector(\"span\").textContent = payload.message;\n    document.querySelector(\"#chat-section ul\").appendChild(messageElement);\n});\n//})();\n\n\n//# sourceURL=webpack://uno-project/./src/client/chat.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/client/chat.ts"]();
/******/ 	
/******/ })()
;