import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure .env is loaded from backend/ before reading process.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const isDevelopment = process.env.NODE_ENV !== 'production';
const isProduction = process.env.NODE_ENV === 'production';

const defaults = {
  development: {
    PORT: 5000,
    FRONTEND_URL: 'http://localhost:3000',
    BACKEND_URL: 'http://localhost:5000',
    GOOGLE_CALLBACK_URL: 'http://localhost:5000/api/google/callback',
  },
  production: {
    PORT: 5000,
    // Prefer process.env in production — these are fallbacks only
    FRONTEND_URL: 'https://uni-hub-theta.vercel.app',
    BACKEND_URL: 'https://unihub-w6ma.onrender.com',
    GOOGLE_CALLBACK_URL: 'https://unihub-w6ma.onrender.com/api/google/callback',
  },
};

const envDefaults = isProduction ? defaults.production : defaults.development;

/**
 * Runtime config — always prefer process.env so Render/local .env overrides hardcodes.
 * Use getters so values are read after dotenv has loaded.
 */
const currentConfig = {
  get PORT() {
    return Number(process.env.PORT) || envDefaults.PORT;
  },
  get FRONTEND_URL() {
    return process.env.FRONTEND_URL || envDefaults.FRONTEND_URL;
  },
  get BACKEND_URL() {
    return process.env.BACKEND_URL || envDefaults.BACKEND_URL;
  },
  get GOOGLE_CALLBACK_URL() {
    return process.env.GOOGLE_CALLBACK_URL || envDefaults.GOOGLE_CALLBACK_URL;
  },
  get MONGODB_URI() {
    return process.env.MONGODB_URI;
  },
  get JWT_SECRET() {
    return process.env.JWT_SECRET || process.env.JWT_KEY_SECRET || (isProduction ? undefined : 'dev-secret-key');
  },
  get GOOGLE_CLIENT_ID() {
    return process.env.GOOGLE_CLIENT_ID;
  },
  get GOOGLE_CLIENT_SECRET() {
    return process.env.GOOGLE_CLIENT_SECRET;
  },
};

export { isDevelopment, isProduction, currentConfig };
