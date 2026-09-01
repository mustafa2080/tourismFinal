import jwt from 'jsonwebtoken';

// 🔐 SECURITY FIX: Validate that JWT secrets are set in production
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

// 🔴 CRITICAL: Fail fast if secrets are not configured
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('❌ CRITICAL: JWT_SECRET must be set in environment variables for production');
}

if (!JWT_REFRESH_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('❌ CRITICAL: JWT_REFRESH_SECRET must be set in environment variables for production');
}

// Fallback for development only
const SAFE_JWT_SECRET = JWT_SECRET || 'dev_secret_key_change_in_production';
const SAFE_JWT_REFRESH_SECRET = JWT_REFRESH_SECRET || 'dev_refresh_secret_key_change_in_production';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const tokenUtils = {
  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, SAFE_JWT_SECRET as string, { expiresIn: JWT_EXPIRE } as any);
  },

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, SAFE_JWT_REFRESH_SECRET as string, { expiresIn: JWT_REFRESH_EXPIRE } as any);
  },

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, SAFE_JWT_SECRET as string) as TokenPayload;
    } catch (error) {
      console.error('🔐 Token verification failed:', (error as any).message);
      return null;
    }
  },

  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, SAFE_JWT_REFRESH_SECRET as string) as TokenPayload;
    } catch (error) {
      console.error('🔐 Refresh token verification failed:', (error as any).message);
      return null;
    }
  },

  decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  },
};
