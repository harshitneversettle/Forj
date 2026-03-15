import crypto from "crypto";

export function Make_hash(data: string) {
  return crypto.createHash("sha256").update(data).digest();
}
