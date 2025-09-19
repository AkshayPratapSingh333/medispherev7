// verifyToken.js - verifies HS256 JWT issued by Next.js /api/socket/token
const { jwtVerify } = require("jose");

const SECRET = process.env.NEXTAUTH_SECRET;
if (!SECRET) {
  console.warn("WARN: NEXTAUTH_SECRET not set - token verification will fail.");
}

async function verifyToken(token) {
  if (!SECRET) throw new Error("Missing NEXTAUTH_SECRET");
  // jose expects a Uint8Array
  const key = new TextEncoder().encode(SECRET);
  const verified = await jwtVerify(token, key);
  // verified.payload contains the claims
  return verified.payload;
}

module.exports = verifyToken;
