import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/mod.ts";
import { Team,Match,Player, User } from "../types.ts";


  /*export type Team = {
    id: string;
    name: string;
    matches: Match[];
    players: Player[];
    goals_for: number;
    goals_against: number;
    classified: boolean;
  };*/
export type TeamSchema = Omit<
  Team,
  "id" | "matches" | "players" | "goals_for" | "goals_against"| "updatedBy"
> & {
  _id: ObjectId;
  players: ObjectId[];
  updatedBy: ObjectId;
};
/*export type Match = {
    id: string;
    team1: Team;
    team2: Team;
    goals_team1: number;
    goals_team2: number;
    date: Date;
    status: MatchStatus;
  };*/
export type MatchSchema = Omit<Match, "id" | "team1" | "team2"|"updatedBy"> & {
  _id: ObjectId;
  team1: ObjectId;
  team2: ObjectId;
  updatedBy: ObjectId;
};

/*
  export type Player = {
    id: string;
    name: string;
    team?: Team;
  };*/
export type PlayerSchema = Omit<Player, "id" | "team"|"updatedBy"> & {
  _id: ObjectId;
  updatedBy: ObjectId;
};

export type UserSchema = Omit<User,"id" | "token"> & {
  _id: ObjectId;
};

