// Environment-aware configuration system
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const config = {
  development: {
    PORT: 5000,
    FRONTEND_URL: 'http://localhost:3000',
    BACKEND_URL: 'http://localhost:5000',
    GOOGLE_CALLBACK_URL: 'http://localhost:5000/api/google/callback',
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
  },
  production: {
    PORT: process.env.PORT || 5000,
    FRONTEND_URL: 'https://uni-hub-theta.vercel.app',
    BACKEND_URL: 'https://unihub-w6ma.onrender.com',
    GOOGLE_CALLBACK_URL: 'https://unihub-w6ma.onrender.com/api/google/callback',
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
  }
};

const currentConfig = config[process.env.NODE_ENV] || config.development;

export { isDevelopment, isProduction, currentConfig };
