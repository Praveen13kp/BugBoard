import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  // Development/test only fallback. Production requires a real JWT_SECRET.
  jwtSecret: process.env.JWT_SECRET || (isProduction ? undefined : 'development-only-jwt-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
};

export default env;
