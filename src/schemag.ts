import {gql} from "https://deno.land/x/graphql_tag@0.0.1/mod.ts";

export const typeDefs = gql`
  scalar Date
  type Team {
    id: ID!
    name: String!
    matches: [Match!]!
    players: [Player!]!
    goals_for: Int!
    goals_against: Int!
    classified: Boolean!
    updatedBy:User!
  }
  enum MatchStatus {
    PENDING
    FINISHED
    PLAYING
  }
  type Match {
    id: ID!
    team1: Team!
    team2: Team!
    goals_team1: Int!
    goals_team2: Int!
    date: String!
    status: MatchStatus!
    updatedBy:User!
  }
  type Player {
    id: ID!
    name: String!
    team: Team
    updatedBy:User!
  }
  type Query {
    Me(token: String!): User!
    getTeams(classified: Boolean): [Team!]!
    getTeam(id: ID!): Team!
    getMatches(status: MatchStatus, team: ID, date: Date): [Match!]!
    getMatch(id: ID!): Match!
    getPlayers(team_id: ID): [Player!]!
    getPlayer(id: ID!): Player!
  }
  type User{
    id: ID!
    name: String!
    email: String!
    pwd: String
    token: String
  }
  
  type Mutation {
    register(name: String!, email: String!, pwd: String!): User!
    login(email: String!, pwd: String!): String!
    createTeam(name: String!, players: [ID!]!, classified: Boolean!, updatedBy: ID!): Team!
    updateTeam(id: ID!, players: [ID!], classified: Boolean, updatedBy: ID!): Team!
    deleteTeam(id: ID!, updatedBy:ID!): Team!
    createMatch(team1: ID!,team2: ID!, goals_team1: Int!, goals_team2: Int!, date: String!, status: MatchStatus!, updatedBy: ID!): Match!
    updateMatch(id: ID!, goals_team1: Int!, goals_team2: Int!, status: MatchStatus!, updatedBy:ID!): Match!
    deleteMatch(id: ID!, updatedBy:ID!): Match!
    createPlayer(name: String, updatedBy: ID!): Player!
    deletePlayer(id: ID!, updatedBy: ID!): Player!
  }
`;