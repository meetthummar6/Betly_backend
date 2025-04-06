import { Match } from "../models/match.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//get all matches
export const getMatches = asyncHandler(async (req, res) => {
    const matches = await Match.find().sort({ time: -1 });
    if (matches.length === 0) {
        throw new ApiError(404, "No matches found");
    }
    return res.status(200).json(new ApiResponse(200, matches, "Matches fetched successfully"));
});

//get match by id
export const getMatchById = asyncHandler(async (req, res) => {
    const match = await Match.findById(req.params.id);
    if (!match) {
        throw new ApiError(404, "Match not found");
    }
    return res.status(200).json(new ApiResponse(200, match, "Match fetched successfully"));
});

//get upcoming 2 matches
export const getUpcomingMatches = asyncHandler(async (req, res) => {
    const matches = await Match.find().where('time').gt(new Date().toISOString()).sort({ date: 1 }).limit(2);
    if (matches.length === 0) {
        throw new ApiError(404, "No upcoming matches found");
    }

    //add odds logic to matches shown
    

    else{
        return res.status(200).json(new ApiResponse(200, matches, "Upcoming match fetched successfully"));
    }
});

//get matches by date
export const getMatchesByDate = asyncHandler(async (req, res) => {
    const matches = await Match.find({ date: req.params.date });
    if (matches.length === 0) {
        throw new ApiError(404, "No matches found");
    }
    return res.status(200).json(new ApiResponse(200, matches, "Matches fetched successfully"));
});