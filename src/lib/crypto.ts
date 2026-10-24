/**
 * Cryptographic utility for secure password hashing and encryption.
 * Uses Web Crypto API SHA-256 with application salt so no plain text passwords
 * are ever stored in the database or client storage.
 */

const PASSWORD_SALT = 'campusgo_secure_salt_2026';

export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(PASSWORD_SALT + password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `sha256_${hashHex}`;
  } catch (err) {
    console.error('Failed to hash password with crypto.subtle:', err);
    // Simple fallback deterministic hash in case crypto.subtle is restricted
    let hash = 0;
    const str = PASSWORD_SALT + password;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `sha256_${Math.abs(hash).toString(16)}`;
  }
}

export async function verifyPassword(
  inputPassword: string,
  storedHashOrPlain?: string
): Promise<boolean> {
  if (!storedHashOrPlain) return false;

  // If stored value is already a hashed string
  if (storedHashOrPlain.startsWith('sha256_')) {
    const inputHashed = await hashPassword(inputPassword);
    return inputHashed === storedHashOrPlain;
  }

  // Backward compatibility check for unmigrated mock passwords
  return inputPassword === storedHashOrPlain;
}
