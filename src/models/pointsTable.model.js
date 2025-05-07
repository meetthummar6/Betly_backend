import mongoose from "mongoose";

const teamStandingSchema = new mongoose.Schema({
    
},{ strict: false });

const pointsTableSchema = new mongoose.Schema({
    table:{
        type:Map,
        of:teamStandingSchema
    }
},{ timestamps: true });

export const PointsTable = mongoose.model("PointsTable", pointsTableSchema);