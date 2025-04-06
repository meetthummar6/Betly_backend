import { Bet } from "../models/bet.model.js";
import { Match } from "../models/match.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";

export const createBet = asyncHandler(async (req, res) => {

    //get user
    const user = await User.findById(bet.userId);

    //check if user exists
    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    //validation
    if (user.balance < req.body.amount) {
        throw new ApiError(400, "Insufficient balance");
    }
    //create bet
    const bet = await Bet.create(req.body);

    //update user balance  
    user.balance -= bet.amount;
    await user.save();


    return res.status(201).json(new ApiResponse(201, bet, "Bet created successfully"));
});

export const getBets = asyncHandler(async (req, res) => {
    const bets = await Bet.find();
    return res.status(200).json(new ApiResponse(200, bets, "Bets fetched successfully"));
});

export const getBetsByUserId = asyncHandler(async (req, res) => {
    const bets = await Bet.find({ userId: req.params.id });
    return res.status(200).json(new ApiResponse(200, bets, "Bets fetched successfully"));
});

export const getBetsByMatchId = asyncHandler(async (req, res) => {
    const bets = await Bet.find({ matchId: req.params.id });
    return res.status(200).json(new ApiResponse(200, bets, "Bets fetched successfully"));
});

export const getBetById = asyncHandler(async (req, res) => {
    const bet = await Bet.findById(req.params.id);
    if (!bet) {
        throw new ApiError(404, "Bet not found");
    }
    return res.status(200).json(new ApiResponse(200, bet, "Bet fetched successfully"));
});


export const settleBets = asyncHandler(async (req, res) => {
    //get results of previous day matches
    const yesterday = () => {
        let d = new Date();
        d.setDate(d.getDate() - 1);
        return d;
      };
      
    const yesterdaydate = yesterday().toISOString().split('T')[0];
    const matches = await Match.find().where('date').eq(yesterdaydate).sort({ date: 1 });
    if (matches.length === 0) {
        throw new ApiError(404, "No matches found");
    }
    for (const match of matches) {
        //get match data from API
        const response = await axios.get(`https://api.cricapi.com/v1/match_info?apikey=${process.env.API_KEY}&id=${match.matchId}`);
        const matchData = response.data.data;

        //find match winner and update status in database
        const winner = matchData.matchWinner;
        await Match.findOneAndUpdate({ matchId: match._id }, { status: matchData.status }, { new: true });

        //find bets
        const bets = await Bet.find({ matchId: match._id });

        for (const bet of bets) {
            if (bet.bet_team === winner) {
                const user = await User.findById(bet.userId);
                user.balance += bet.amount * bet.bet_odds;
                await user.save();
            }
            await Bet.findOneAndUpdate({ _id: bet._id }, { status: "Settled" }, { new: true });
        }
    }
    return res.status(200).json(new ApiResponse(200, "Bets settled successfully"));
});