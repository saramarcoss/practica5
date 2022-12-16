import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { TeamCollection,PlayerCollection,MatchCollection, UsersCollection } from "../db/database.ts";
import { TeamSchema,PlayerSchema,MatchSchema, UserSchema } from "../db/schema.ts";
import { MatchStatus, User } from "../types.ts";
import { verifyJWT } from "../utils/jwt.ts";


/*  getTeams(classified: Boolean): [Team!]!
    getTeam(id: ID!): Team!
    getMatches(status: MatchStatus, team: ID, date: Date): [Match!]!
    getMatch(id: ID!): Match!
    getPlayers(team_id: ID): [Player!]!
    getPlayer(id: ID!): Player!*/

export const Query = {
  Me: async (_parent: unknown, args: { token: string }) => {
    try {
      const user: User = (await verifyJWT( // se verifica que el token corresponda a un usuario registrado 
        args.token,
        Deno.env.get("JWT_SECRET")!//se obtiene el secret del archivo .env para verificar el token
      )) as User;
      return user; //se devuelve el usuario
    } catch (e) {
      throw new Error(e);
    }
  },

    getTeams: async (
      _: unknown,
      args: { classified?: boolean }
    ): Promise<TeamSchema[]> => {
      try {
        if (args.classified !== undefined) {
          return await TeamCollection.find({}).toArray(); //busca en teamCollection todos los elementos y los convierte en array
        }
  
        const teams = await TeamCollection.find({ //busca en teamCollection todos los elementos segun el parametro y los convierte en array
          classified: args.classified,
        }).toArray();
        return teams;
      } catch (e) {
        throw new Error(e);
      }
    },
    getTeam: async (_: unknown, args: { id: string }): Promise<TeamSchema> => {
      try {
        const team = await TeamCollection.findOne({ _id: new ObjectId(args.id) });
        if (!team) {
          throw new Error("Team not found");
        }
        return team;
      } catch (e) {
        throw new Error(e);
      }
    },
    getPlayers: async (
      _: unknown,
      args: { team_id?: string }
    ): Promise<PlayerSchema[]> => {
      try {
        if (args.team_id) {
          const team = await TeamCollection.findOne({
            _id: new ObjectId(args.team_id),
          });
          if (!team) {
            throw new Error("Team not found");
          }
          return await PlayerCollection.find({
            _id: { $in: team.players },//busca en playerCollection los jugadores de team y los convierte en array.
          }).toArray();
          //$in selecciona todos los documentos de la colleccion playersCollectionen que cuyo valor del campo _id coincida con team.players.
        }
        const players = await PlayerCollection.find({}).toArray(); //si no se ha introducido ningun parametro, busca todos los jugadores
        return players;
      } catch (e) {
        throw new Error(e);
      }
    },
    getPlayer: async (_: unknown, args: { id: string }): Promise<PlayerSchema> => {
      try {
        const player = await PlayerCollection.findOne({
          _id: new ObjectId(args.id),
        });
        if (!player) {
          throw new Error("Player not found");
        }
        return player;
      } catch (e) {
        throw new Error(e);
      }
    },
    getMatches: async (
      _: unknown,
      args: { status?: MatchStatus; team?: string; date?: Date }
    ): Promise<MatchSchema[]> => {
      try {
        let filter = {};
        if (args.status) {//si se ha introducido un estado, busca en matchCollection todos los partidos con ese estado
          filter = { status: args.status };
        }
  
        if (args.team) {
          filter = {
            ...filter,//si se ha introducido un equipo, busca en matchCollection todos los partidos con ese equipo sumado a los partidos con el estado introducido
            $or: [ //$or asocia el team introducido con el equipo 1 o el equipo 2 
              { team1: new ObjectId(args.team) },
              { team2: new ObjectId(args.team) },
            ],
          };
        }
  
        if (args.date) { //si se ha introducido una fecha, busca en matchCollection todos los partidos con esa fecha sumado a los partidos con el estado y equipo introducido
          filter = { ...filter, date: args.date };
        }
  
        const matches = await MatchCollection.find(filter).toArray();
        return matches;
      } catch (e) {
        throw new Error(e);
      }
    },
    getMatch: async (_: unknown, args: { id: string }): Promise<MatchSchema> => {
      try {
        const match = await MatchCollection.findOne({
          _id: new ObjectId(args.id),
        });
        if (!match) {
          throw new Error("Match not found");
        }
        return match;
      } catch (e) {
        throw new Error(e);
      }
    },
  };