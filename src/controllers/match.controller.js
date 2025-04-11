import { Match } from "../models/match.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from 'axios';
import { load} from 'cheerio';


//get match by id
export const getMatchById = asyncHandler(async (req, res) => {
    const match = await Match.findById(req.params.id);
    if (!match) {
        throw new ApiError(404, "Match not found");
    }
    return res.status(200).json(new ApiResponse(200, match, "Match fetched successfully"));
});

//get upcoming 10 matches
export const getUpcomingMatches = asyncHandler(async (req, res) => {
    const now = new Date();
    const possibleTime = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();
    const matches = await Match.find({
        time: {
            $gte: possibleTime
        }
    }).sort({ time: 1 }).limit(10);
    if (matches.length === 0) {
        throw new ApiError(404, "No upcoming matches found");
    }
    let enrichedMatches = [];
    const start=new Date(matches[0].time+'Z');
    const end=new Date(new Date(matches[0].time+'Z').getTime()+4*60*60*1000);
    const isLive=now>=start && now<=end;
    enrichedMatches=matches.map((match,idx)=>{
        return {
            ...match.toObject(),
            isLive:isLive && idx===0
        };
    });
    return res.status(200).json(new ApiResponse(200, enrichedMatches, "Upcoming match fetched successfully"));
});

//get matches by date
export const getMatchesByDate = asyncHandler(async (req, res) => {
    const matches = await Match.find({ date: req.params.date });
    if (matches.length === 0) {
        throw new ApiError(404, "No matches found");
    }
    return res.status(200).json(new ApiResponse(200, matches, "Matches fetched successfully"));
});

//get odds for upcoming 4 matches from API
export const getOdds = asyncHandler(async (req, res) => {
    const headers={
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.8'
    };

    const getPointsTable = async () => {
        const url="https://www.espncricinfo.com/series/ipl-2025-1449924/points-table-standings";
        const response = await axios.get(url, { headers });
        const $ = load(response.data);
        const pointsTable = {};
        const IPLTable =$('table.ds-w-full').first();
        IPLTable.find('tbody tr').each((index, row) => {
            const cols = $(row).find('td');
            if(cols.length >= 9){
                let team;
                let form='';
                if(index==18){
                    team = $(cols[0]).text().trim().substring(2);
                }
                else{
                    team = $(cols[0]).text().trim().substring(1);
                }
                const pos=(index/2)+1;
    
                //complex form data
                const dt=$(cols[8]).find('span');
                for(let i=0;i<dt.length;i++){
                    form+=dt.eq(i).text().trim();
                    if(i<dt.length-1){
                        form+=' ';
                    }
                }
                const lasts=form.split(' ').filter(r => ['W'].includes(r));
                pointsTable[team] = { position: pos, wins_last5: lasts.length };
            }
        })
        return pointsTable;
    };     

    try{
        const pointsTable = await getPointsTable();
        const matches = await Match.find().where('time').gt(new Date().toISOString()).sort({ time: 1 }).limit(4);
        for (const match of matches) {
            const team1 = match.teams.team1;
            const team2 = match.teams.team2;
            const team1Points = pointsTable[team1]?.position || 0;
            const team2Points = pointsTable[team2]?.position || 0;
            const team1WinsLast5 = pointsTable[team1]?.wins_last5 || 0;
            const team2WinsLast5 = pointsTable[team2]?.wins_last5 || 0;

            const { team1Odds, team2Odds } = await calculateOdds(team1Points, team2Points, team1WinsLast5, team2WinsLast5);

            await Match.findOneAndUpdate({ _id: match._id }, { $set: { 'teams.team1Odds':team1Odds, 'teams.team2Odds':team2Odds } }, { new: true });
        }
        return res.status(200).json(new ApiResponse(200, matches, "Odds fetched successfully"));
    }
    catch(error){
        return res.status(500).json(new ApiResponse(500, error, "Error fetching odds"));
    }
});

//calculate odds
const calculateOdds = async(team1Points, team2Points,team1WinsLast5, team2WinsLast5) => {

    const team1PosProb = (team2Points / (team1Points + team2Points));
    const team2PosProb = (team1Points / (team1Points + team2Points));

    const team1WinsProb = (team1WinsLast5 / (team1WinsLast5+ team2WinsLast5));
    const team2WinsProb = (team2WinsLast5 / (team1WinsLast5 + team2WinsLast5));

    const team1Prob = (0.6*team1PosProb) + (0.4*team1WinsProb)+0.05;
    const team2Prob = (0.6*team2PosProb) + (0.4*team2WinsProb)+0.05;

    const team1Odds = 1 / team1Prob;
    const team2Odds = 1 / team2Prob;

    return { team1Odds, team2Odds };
};