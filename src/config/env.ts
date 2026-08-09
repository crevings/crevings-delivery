import { z } from 'zod';

export const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://127.0.0.1:42007/api'),
  VITE_GOOGLE_MAPS_PLATFORM_KEY: z.string().optional(),
  VITE_GEMINI_API_KEY: z.string().optional(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_ENABLE_MOCK_DATA: z.boolean().default(true),
  VITE_SSE_ENABLED: z.boolean().default(true),
  VITE_LOCATION_TRACKING_INTERVAL: z.number().default(20000),
  VITE_ORDER_POLL_INTERVAL: z.number().default(30000),
});

export const env = envSchema.parse(import.meta.env);

export const isDevelopment = env.VITE_APP_ENV === 'development';
export const isProduction = env.VITE_APP_ENV === 'production';
export const isStaging = env.VITE_APP_ENV === 'staging';
