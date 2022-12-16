import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/mod.ts";
import { UserSchema } from "../db/schema.ts";
import { User } from "../types.ts";

const UserResolver = {
    id: (parent: UserSchema | User) =>
      (parent as User).id
        ? (parent as User).id //si existe el id en el parent, lo devuelve
        : new ObjectId((parent as UserSchema)._id), //si no existe el id en el parent, lo crea
  };
  
  export default UserResolver;