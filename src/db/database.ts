import { MongoClient, Database } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { MatchSchema, PlayerSchema, TeamSchema, UserSchema } from "./schema.ts";
import { config } from "https://deno.land/std@0.161.0/dotenv/mod.ts";

await config({ export: true, allowEmptyValues: true });


const connectMongoDB = async (): Promise<Database> => {
    const mongo_usr = "Database_smarcosc";
    const mongo_pwd = "Database12";
    const db_name = "Futbol";
    const mongo_url = `mongodb+srv://${mongo_usr}:${mongo_pwd}@cluster0.r4chzbf.mongodb.net/${db_name}?authMechanism=SCRAM-SHA-1`;
  
    const client = new MongoClient();
    await client.connect(mongo_url);
    const db = client.database(db_name);
    return db;
  };
  
  const db = await connectMongoDB();
  console.info(`MongoDB ${db.name} connected`);
  
export const MatchCollection = db.collection<MatchSchema>("matches");
export const TeamCollection = db.collection<TeamSchema>("teams");
export const PlayerCollection = db.collection<PlayerSchema>("players");
export const UsersCollection=db.collection<UserSchema>("users");