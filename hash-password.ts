import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  const password = "test123";
  const hashed = await hashPassword(password);
  console.log(`Password: ${password}`);
  console.log(`Hashed: ${hashed}`);
}

main().catch(console.error);
