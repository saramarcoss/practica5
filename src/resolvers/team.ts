import { MatchCollection,PlayerCollection } from "../db/database.ts";
import { TeamSchema,PlayerSchema,MatchSchema } from "../db/schema.ts";

export const Team = { //resolver para el campo matches,players,goals_for,goals_against de Team
    id: (parent: TeamSchema): string => parent._id.toString(),
    updatedBy: (parent: TeamSchema): string => parent.updatedBy.toString(),
    matches: async (parent: TeamSchema): Promise<MatchSchema[]> => {
      try {
        const matches = await MatchCollection.find({
          $or: [{ team1: parent._id }, { team2: parent._id }],
        }).toArray();
        return matches;
      } catch (e) {
        throw new Error(e);
      }
    },
    players: async (parent: TeamSchema): Promise<PlayerSchema[]> => {
      try {
        const players = await PlayerCollection.find({
          _id: { $in: parent.players },
        }).toArray();
        return players;
      } catch (e) {
        throw new Error(e);
      }
    },
    goals_for: async (parent: TeamSchema): Promise<number> => {
      try {
        const matches = await MatchCollection.find({
          $or: [{ team1: parent._id }, { team2: parent._id }],
        }).toArray();
  
        const goals = matches.reduce((acc, match) => {
          if (match.team1.toString() === parent._id.toString()) {
            return acc + match.goals_team1;
          } else {
            return acc + match.goals_team2;
          }
        }, 0);
        return goals;
      } catch (e) {
        throw new Error(e);
      }
    },
    goals_against: async (parent: TeamSchema): Promise<number> => {
      try {
        const matches = await MatchCollection.find({
          $or: [{ team1: parent._id }, { team2: parent._id }],
        }).toArray();
  
        const goals = matches.reduce((acc, match) => {
          if (match.team1.toString() === parent._id.toString()) {
            return acc + match.goals_team2;
          } else {
            return acc + match.goals_team1;
          }
        }, 0);
        return goals;
      } catch (e) {
        throw new Error(e);
      }
    },
  };