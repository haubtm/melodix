import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  frontendUrl: process.env.APP_FRONTEND_URL || 'http://localhost:3001',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    email: process.env.ADMIN_EMAIL || 'haubtm699@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'Goldcuber123@',
  },
}));
