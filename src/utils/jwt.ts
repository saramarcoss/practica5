import { create, Header, Payload, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { User } from "../types.ts";

const encoder = new TextEncoder();

const generateKey = async (secretKey: string): Promise<CryptoKey> => {
  const keyBuf = encoder.encode(secretKey);
  return await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign", "verify"]
  );
};

export const createJWT = async (
  payload: User, //payload es el objeto que se va a encriptar
  secretKey: string //secretKey es la clave secreta que se va a usar para encriptar
): Promise<string> => {
  const header: Header = {
    alg: "HS256",
};

  const key = await generateKey(secretKey);

  return create(header, payload, key);
};

export const verifyJWT = async (
  token: string, //token es el token que se va a verificar
  secretKey: string //secretKey es la clave secreta que se va a usar para verificar el token
): Promise<Payload> => {
  try {
    const key = await generateKey(secretKey);
    return await verify(token, key);
  } catch (error) {
    return error.message;
  }
};