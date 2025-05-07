import mongoose from "mongoose";

const pointsTableSchema = new mongoose.Schema({
    data: {
        type: Object,
        required: true
    }
},{ timestamps: true });

export const PointsTable = mongoose.model("PointsTable", pointsTableSchema);