import { TeamCollection } from "../db/database.ts";
import { MatchSchema,TeamSchema } from "../db/schema.ts";

export const Match = {//resolver para el campo id, team1 y team2 de Match. se hace para los campos se omiten en el schema.ts
    id: (parent: MatchSchema): string => parent._id.toString(),
    updatedBy: (parent: MatchSchema): string => parent.updatedBy.toString(),
    team1: async (parent: MatchSchema): Promise<TeamSchema> => {
      try {
        const team = await TeamCollection.findOne({ _id: parent.team1 });
        if (!team) {
          throw new Error("Team not found");
        }
        return team;
      } catch (e) {
        throw new Error(e);
      }
    },
    team2: async (parent: MatchSchema): Promise<TeamSchema> => {
      try {
        const team = await TeamCollection.findOne({ _id: parent.team2 });
        if (!team) {
          throw new Error("Team not found");
        }
        return team;
      } catch (e) {
        throw new Error(e);
      }
    },
  };