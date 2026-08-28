import { z } from 'zod';

export const envSchema = z.object({
  VITE_PUBLIC_BASE_API_URL: z.string().optional().default('https://backend.crevings.com'),
  VITE_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(import.meta.env);
