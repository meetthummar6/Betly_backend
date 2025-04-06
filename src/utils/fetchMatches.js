import 'dotenv/config';
import axios from 'axios';
import mongoose from 'mongoose';
import {Match} from '../models/match.model.js';

const fetchMatches = async () => {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    try {
        // Fetch matches
        const response = await axios.get(`https://api.cricapi.com/v1/series_info?apikey=${process.env.API_KEY}&offset=0&id=${process.env.SERIES_ID}`);
        const matches = response.data.data.matchList;
        console.log(matches);

        // Save matches to database
        for (const match of matches) {
            const newMatch = new Match({
                matchId: match.id,
                name: match.name,
                date: match.date,
                time: match.dateTimeGMT,
                status: match.status,
                venue: match.venue,
                teams:{
                    team1: match.teams[0],
                    team2: match.teams[1]
                }
            });
            await newMatch.save();
            console.log('Match saved to database');
        }
    } catch (error) {
        console.error(error);
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();

    console.log('Matches saved to database');
};

fetchMatches();
