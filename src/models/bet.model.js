import mongoose from "mongoose";

const betSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Match',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    bet_team:{
        type:String,
        required:true,
    },
    bet_odds:{
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default:'Pending'
    }
});

export const Bet = mongoose.model("Bet", betSchema);