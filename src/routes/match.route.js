import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getMatchById, getUpcomingMatches, getMatchesByDate, getOdds } from "../controllers/match.controller.js";

const router = Router();

router.get("/match/:id", asyncHandler(getMatchById));
router.get("/upcoming-matches", asyncHandler(getUpcomingMatches));
router.get("/matches-by-date/:date", asyncHandler(getMatchesByDate));
router.get("/odds", asyncHandler(getOdds));

export default router;