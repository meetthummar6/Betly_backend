import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    matchId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    venue: {
        type: String,
        required: true
    },
    teams:{
        team1:{
            type: String,
            required: true
        },
        team1Odds: {
            type: Number
        },
        team2:{
            type: String,
            required: true
        },
        team2Odds: {
            type: Number
        }
    },
    matchWinner: {
        type: String
    }
});

export const Match = mongoose.model("Match", matchSchema);