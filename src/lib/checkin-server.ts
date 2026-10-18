import 'server-only';
import { randomBytes } from 'node:crypto';

// 128 random bits, URL safe: cannot be guessed or enumerated.
export const newCheckinCode = () => randomBytes(16).toString('base64url');
