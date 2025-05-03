import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createBet, getBetsByUserId, getBetsByMatchId, getBetById, getBets, settleBets } from "../controllers/bet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT,createBet);
router.get("/user/:id",verifyJWT,getBetsByUserId);
router.get("/match/:id", verifyJWT,getBetsByMatchId);
router.get("/settle", settleBets);
router.get("/:id", verifyJWT,getBetById);
router.get("/",verifyJWT,getBets);


export default router;