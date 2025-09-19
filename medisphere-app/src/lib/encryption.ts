// lib/encryption.ts
import crypto from "crypto";

/**
 * Simple AES-256-GCM encryption utilities for small files/strings.
 * IMPORTANT: in prod use KMS/secure key management. FILE_SECRET_KEY must be 32 bytes (or will be sliced/padded).
 */
const KEY = Buffer.from(process.env.FILE_SECRET_KEY || "development_test_key_must_be_32_bytes!").slice(0, 32);
const ALGO = "aes-256-gcm";

export function encryptBuffer(buf: Buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const enc = Buffer.concat([cipher.update(buf), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: enc.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptToBuffer(ciphertextB64: string, ivB64: string, tagB64: string) {
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const encrypted = Buffer.from(ciphertextB64, "base64");
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return dec;
}
