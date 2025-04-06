import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createBet, getBetsByUserId, getBetsByMatchId, getBetById, getBets, settleBets } from "../controllers/bet.controller.js";

const router = Router();

router.post("/", asyncHandler(createBet));
router.get("/user/:id", asyncHandler(getBetsByUserId));
router.get("/match/:id", asyncHandler(getBetsByMatchId));
router.get("/settle", asyncHandler(settleBets));
router.get("/:id", asyncHandler(getBetById));
router.get("/", asyncHandler(getBets));


export default router;