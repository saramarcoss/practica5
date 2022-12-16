import { Server } from "https://deno.land/std@0.165.0/http/server.ts";
import { GraphQLHTTP } from "https://deno.land/x/gql@1.1.2/mod.ts";
import { makeExecutableSchema } from "https://deno.land/x/graphql_tools@0.0.2/mod.ts";
import { Match } from "./resolvers/match.ts";
import { Mutation } from "./resolvers/mutation.ts";
import { Player } from "./resolvers/player.ts";
import { Query } from "./resolvers/query.ts";
import { Team } from "./resolvers/team.ts";
import UserResolver from "./resolvers/user.ts";

import { typeDefs } from "./schemag.ts";


const resolvers = {
  Query,
  Mutation,
  Match,
  Player,
  Team,
  User:UserResolver
}

const s = new Server({
  handler: async (req) => {
    const { pathname } = new URL(req.url);

    return pathname === "/graphql"
      ? await GraphQLHTTP<Request>({
          schema: makeExecutableSchema({ resolvers, typeDefs }),
          graphiql: true,
        })(req)
      : new Response("Not Found", { status: 404 });
  },
  port: 3000,
});

s.listenAndServe();

console.log(`Server running on: http://localhost:3000/graphql`);