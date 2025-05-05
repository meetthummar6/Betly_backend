import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getMatchById, getUpcomingMatches, getMatchesByDate, getOdds } from "../controllers/match.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/match/:id", verifyJWT,getMatchById);
router.get("/upcoming-matches",verifyJWT,getUpcomingMatches);
router.get("/matches-by-date/:date", verifyJWT,getMatchesByDate);
router.post("/odds", getOdds);

export default router;