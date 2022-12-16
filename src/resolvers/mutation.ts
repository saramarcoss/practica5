import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/mod.ts";
import { TeamCollection,PlayerCollection,MatchCollection, UsersCollection } from "../db/database.ts";
import { TeamSchema,PlayerSchema,MatchSchema, UserSchema } from "../db/schema.ts";
import { MatchStatus } from "../types.ts";
import { createJWT } from "../utils/jwt.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

export const Mutation = {
register: async (
    _: unknown,
    args: { name: string; email: string; pwd: string }
  ): Promise<UserSchema & { token: string}>=> {
    try {
      const { email} = args;
      const exists = await UsersCollection.findOne({
        email,
      });
      if (exists) {
        throw new Error("User already exists");
      }
      const hashedPassword = await bcrypt.hash(args.pwd);//encripto la contraseña
      const _id = new ObjectId();
      const token = await createJWT(//creo el token para el usuario que se registra
        { 
          name: args.name,
          email: args.email,
          id: _id.toString(),
        },
        Deno.env.get("JWT_SECRET")! //clave secreta para generar el token
      );
      const newUser: UserSchema = { //creo el usuario
        _id,
        name: args.name,
        email: args.email,
        pwd: hashedPassword,
      };
      await UsersCollection.insertOne(newUser); //inserto el usuario en la base de datos
      return { //devuelvo el usuario y el token
        ...newUser,
        token,
      };  
    } catch (e) {
      throw new Error(e);
    }
  },

  login: async (
    _parent: unknown,
    args: {
      email: string;
      pwd: string;
    }
  ): Promise<string> => {
    try {
      const user: UserSchema | undefined = await UsersCollection.findOne({
        email: args.email,
      });
      if (!user) {
        throw new Error("User does not exist");
      }
      if(user.pwd === undefined) throw new Error("User does not exist");
      const validPassword = await bcrypt.compare(args.pwd, user.pwd);
      if (!validPassword) {
        throw new Error("Invalid password");
      }
      const token = await createJWT( //creo el token para el usuario que se loguea
        {
          email: user.email,
          name: user.name,
          id: user._id.toString(),
        },
        Deno.env.get("JWT_SECRET")!
      );
      return token; //devuelvo el token
    } catch (e) {
      throw new Error(e);
    }
  },
    createTeam: async (
      _: unknown,
      args: { name: string, players: string[], classified: boolean, updatedBy: string }
    ): Promise<TeamSchema> => {
      try {
        const { name, players, classified } = args;
        const exists = await TeamCollection.findOne({
          name,
        });
        if (exists) {
          throw new Error("Team already exists");
        }
        //comprobar que el usuario está logeado
        const user = await UsersCollection.findOne({
          _id: new ObjectId(args.updatedBy),
        });
        if(!user) throw new Error("User is not logged");
  
        const _id = await TeamCollection.insertOne({ //inserto el equipo y _id se genera al insertar
          name,
          classified,
          players: players.map((p) => new ObjectId(p)),//convierto el id de string a ObjectId.
          updatedBy: new ObjectId(args.updatedBy),
        });
        return {
          _id,
          name,
          classified,
          players: players.map((p) => new ObjectId(p)),
          updatedBy: new ObjectId(args.updatedBy)
        };
      } catch (e) {
        throw new Error(e);
      }
    },
  
    updateTeam: async (
      _: unknown,
      args: {
        id: string;
        players?: string[];
        classified?: boolean;
        updatedBy: string;

      }
    ): Promise<TeamSchema> => {
      try {
        const { id, players, classified } = args;
        //comprobar que el usuario está logeado
        const user = await UsersCollection.findOne({
          _id: new ObjectId(args.updatedBy),
        });
        if(!user) throw new Error("User is not logged");

        const _id = new ObjectId(id);
        let set = {};
        if (players) {
          set = { ...set, players: players?.map((p) => new ObjectId(p)) };
        }
        if (classified) {
          set = { ...set, classified };
        }
        const team = await TeamCollection.updateOne(
          { _id },
          {
            $set: set,
          }
        );
  
        if (team.matchedCount === 0) { //matchedCount devuelve el numero de documentos que coinciden con la consulta  de updateOne
          throw new Error("Team not found");
        }
  
        return (await TeamCollection.findOne({//busco el equipo por id y lo devuelvo
          _id,
        })) as TeamSchema; //como findOne devuelve un documento de tipo any, lo casteo a TeamSchema
      } catch (e) {
        throw new Error(e);
      }
    },
    deleteTeam: async (_: unknown, args: { id: string; updatedBy: string }): Promise<TeamSchema> => {
      try {
        //comprobar que el usuario está logeado
        const user = await UsersCollection.findOne({
          _id: new ObjectId(args.updatedBy),
        });
        if(!user) throw new Error("User is not logged");

        const { id } = args;
        const _id = new ObjectId(id);
        const team = await TeamCollection.findOne({
          _id,
        });
        if (!team) {
          throw new Error("Team not found");
        }
        await TeamCollection.deleteOne({ _id });
        return team;
      } catch (e) {
        throw new Error(e);
      }
    },
  
    createMatch: async (
      _: unknown,
      args: {
        team1: string;
        team2: string;
        goals_team1: number;
        goals_team2: number;
        date: Date;
        status: MatchStatus;
        updatedBy: string;
      }
    ): Promise<MatchSchema> => {
      try {
        //comprobar que el usuario está logeado
        const user = await UsersCollection.findOne({
          _id: new ObjectId(args.updatedBy),
        });
        if(!user) throw new Error("User is not logged");

        const { team1, team2, goals_team1, goals_team2, date, status } = args;
        const exists = await MatchCollection.findOne({
          team1: new ObjectId(team1),
          team2: new ObjectId(team2),
          date,
        });
        if (exists) {
          throw new Error("Match already exists");
        }
  
        const _id = await MatchCollection.insertOne({
          team1: new ObjectId(team1),
          team2: new ObjectId(team2),
          goals_team1,
          goals_team2,
          date,
          status,
          updatedBy: new ObjectId(args.updatedBy),
        });
        return {
          _id,
          team1: new ObjectId(team1),
          team2: new ObjectId(team2),
          goals_team1,
          goals_team2,
          date,
          status,
          updatedBy: new ObjectId(args.updatedBy),
        };
      } catch (e) {
        throw new Error(e);
      }
    },
    updateMatch: async (
      _: unknown,
      args: {
        id: string;
        goals_team1: number;
        goals_team2: number;
        status: MatchStatus;
        updatedBy: string;
      }
    ): Promise<MatchSchema> => {
      try {
        //comprobar que el usuario está logeado
        const user = await UsersCollection.findOne({
          _id: new ObjectId(args.updatedBy),
        });
        if(!user) throw new Error("User is not logged");

        const { id, goals_team1, goals_team2, status } = args;
        const _id = new ObjectId(id);
        const match = await MatchCollection.updateOne(
          {
            _id,
          },
          {
            $set: {
              goals_team1,
              goals_team2,
              status,
            },
          }
        );
        if (match.matchedCount === 0) { //matchedCount devuelve el numero de documentos que coinciden con la consulta  de updateOne
          throw new Error("Match not found");
        }
        return (await MatchCollection.findOne({
          _id,
        })) as MatchSchema;
      } catch (e) {
        throw new Error(e);
      }
    },
    deleteMatch: async (
      _: unknown,
      args: { id: string; updatedBy: string }
    ): Promise<MatchSchema> => {
      try {
        //comprobar que el usuario está logeado
        const user = await UsersCollection.findOne({
          _id: new ObjectId(args.updatedBy),
        });
        if(!user) throw new Error("User is not logged");
        const { id } = args;
        const _id = new ObjectId(id);
        const match = await MatchCollection.findOne({
          _id,
        });
        if (!match) {
          throw new Error("Match not found");
        }
        await MatchCollection.deleteOne({ _id });
        return match;
      } catch (e) {
        throw new Error(e);
      }
    },
    createPlayer: async (
      _: unknown,
      args: { name: string, updatedBy:string }
    ): Promise<PlayerSchema> => {
      try {
        //comprobar que el usuario está logeado
        const user = await UsersCollection.findOne({
          _id: new ObjectId(args.updatedBy),
        });
        if(!user) throw new Error("User is not logged");

        const { name } = args;
        const _id = await PlayerCollection.insertOne({
          name,
          updatedBy: new ObjectId(args.updatedBy),
        });
        return {
          _id,
          name,
          updatedBy: new ObjectId(args.updatedBy),
        };
      } catch (e) {
        throw new Error(e);
      }
    },
    deletePlayer: async (
      _: unknown,
      args: { id: string; updatedBy: string }
    ): Promise<PlayerSchema> => {
      try {
        //comprobar que el usuario está logeado
        const user = await UsersCollection.findOne({
          _id: new ObjectId(args.updatedBy),
        });
        if(!user) throw new Error("User is not logged");

        const { id } = args;
        const _id = new ObjectId(id);
        const player = await PlayerCollection.findOne({
          _id,
        });
        if (!player) {
          throw new Error("Player not found");
        }
        await PlayerCollection.deleteOne({
          _id,
        });
        return player;
      } catch (e) {
        throw new Error(e);
      }
    },
  };