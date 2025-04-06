import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getMatches, getMatchById, getUpcomingMatches, getMatchesByDate } from "../controllers/match.controller.js";

const router = Router();

router.get("/matches", asyncHandler(getMatches));
router.get("/match/:id", asyncHandler(getMatchById));
router.get("/upcoming-matches", asyncHandler(getUpcomingMatches));
router.get("/matches-by-date/:date", asyncHandler(getMatchesByDate));

export default router;