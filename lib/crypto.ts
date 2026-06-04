const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

export function isBrowserCryptoAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.crypto !== "undefined" &&
    typeof window.crypto.subtle !== "undefined" &&
    typeof window.crypto.getRandomValues !== "undefined"
  );
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function deriveAesGcmKeyFromSecret(
  secret: string,
): Promise<CryptoKey> {
  if (!isBrowserCryptoAvailable()) {
    throw new Error("Web Crypto API is not available in this environment.");
  }

  const secretKey = await window.crypto.subtle.importKey(
    "raw",
    ENCODER.encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: ENCODER.encode("propman-local-storage-encryption"),
      iterations: 200000,
      hash: "SHA-256",
    },
    secretKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptString(
  key: CryptoKey,
  plaintext: string,
): Promise<string> {
  if (!isBrowserCryptoAvailable()) {
    throw new Error("Web Crypto API is not available in this environment.");
  }

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    ENCODER.encode(plaintext),
  );

  return `${arrayBufferToBase64(iv.buffer)}:${arrayBufferToBase64(ciphertext)}`;
}

export async function decryptString(
  key: CryptoKey,
  payload: string,
): Promise<string> {
  if (!isBrowserCryptoAvailable()) {
    throw new Error("Web Crypto API is not available in this environment.");
  }

  const [ivBase64, ciphertextBase64] = payload.split(":");
  if (!ivBase64 || !ciphertextBase64) {
    throw new Error("Invalid encrypted payload format.");
  }

  const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
  const ciphertext = base64ToArrayBuffer(ciphertextBase64);
  const plaintextBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );

  return DECODER.decode(plaintextBuffer);
}
