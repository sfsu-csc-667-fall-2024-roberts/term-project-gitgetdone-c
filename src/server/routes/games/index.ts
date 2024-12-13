import { Router } from "express";
import createGameRoute from "./createGame";
import joinGameRoute from "./joinGame";
import gameStateRoute from "./gameState";
import playCardRoute from "./playCard";
import drawCardRoute from "./drawCard";

const router = Router();

router.use("/", createGameRoute);
router.use("/", joinGameRoute);
router.use("/", gameStateRoute);
router.use("/", playCardRoute);
router.use("/", drawCardRoute);

export default router;
