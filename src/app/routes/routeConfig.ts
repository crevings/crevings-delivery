import { RouteObject } from 'react-router-dom';

export type AppRoute = RouteObject & {
  requiresAuth?: boolean;
  title?: string;
};
