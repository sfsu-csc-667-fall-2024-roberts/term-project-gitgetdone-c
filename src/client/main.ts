import {io} from 'socket.io-client';

//@ts-expect-error TODO: Define the socket object on window for TS
window.socket = io();
//console.log("socket", socket);