import { pbkdf2, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const pbkdf2Async = promisify(pbkdf2);
const iterations = 310000;
const keyLength = 32;
const digest = "sha256";

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await pbkdf2Async(
    password,
    salt,
    iterations,
    keyLength,
    digest,
  );

  return `pbkdf2$${iterations}$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, iterationsValue, salt, storedHash] = passwordHash.split("$");

  if (algorithm !== "pbkdf2" || !iterationsValue || !salt || !storedHash) {
    return false;
  }

  const parsedIterations = Number(iterationsValue);

  if (!Number.isInteger(parsedIterations) || parsedIterations <= 0) {
    return false;
  }

  const storedBuffer = Buffer.from(storedHash, "hex");
  const derivedKey = await pbkdf2Async(
    password,
    salt,
    parsedIterations,
    storedBuffer.length,
    digest,
  );

  return (
    storedBuffer.length === derivedKey.length &&
    timingSafeEqual(storedBuffer, derivedKey)
  );
}
