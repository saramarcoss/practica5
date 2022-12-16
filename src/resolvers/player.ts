import { TeamCollection } from "../db/database.ts";
import { PlayerSchema,TeamSchema } from "../db/schema.ts";

export const Player = {//resolver para el campo team de Player 
    id: (parent: PlayerSchema): string => parent._id.toString(),
    updatedBy: (parent: PlayerSchema): string => parent.updatedBy.toString(),
    team: async (parent: PlayerSchema): Promise<TeamSchema | undefined> => {
      try {
        const team = await TeamCollection.findOne({
          players: parent._id,
        });
        return team;
      } catch (e) {
        throw new Error(e);
      }
    },
  };