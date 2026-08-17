import { lazy } from 'react';
import { Tab } from '@/types';

export interface RouteDefinition {
  path: string;
  tab: Tab;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  requiresAuth: boolean;
  title: string;
  icon?: string;
}

export const ROUTES: RouteDefinition[] = [
  { path: '/', tab: Tab.HOME, component: lazy(() => import('@/features/dashboard/Dashboard')), requiresAuth: true, title: 'Dashboard' },
  { path: '/orders', tab: Tab.ORDERS, component: lazy(() => import('@/features/orders/OrdersView').then(m => ({ default: m.OrdersView }))), requiresAuth: true, title: 'Orders' },
  { path: '/order-history', tab: Tab.ORDER_HISTORY, component: lazy(() => import('@/features/orders/OrderHistoryView').then(m => ({ default: m.OrderHistoryView }))), requiresAuth: true, title: 'Order History' },
  { path: '/earnings', tab: Tab.EARNINGS, component: lazy(() => import('@/features/earnings/EarningsView').then(m => ({ default: m.EarningsView }))), requiresAuth: true, title: 'Earnings' },
  { path: '/inventory', tab: Tab.INVENTORY, component: lazy(() => import('@/features/inventory/InventoryView').then(m => ({ default: m.InventoryView }))), requiresAuth: true, title: 'Inventory' },
  { path: '/profile', tab: Tab.PROFILE, component: lazy(() => import('@/features/profile/ProfileView').then(m => ({ default: m.ProfileView }))), requiresAuth: true, title: 'Profile' },
  { path: '/settings', tab: Tab.SETTINGS, component: lazy(() => import('@/features/settings/SettingsView').then(m => ({ default: m.SettingsView }))), requiresAuth: true, title: 'Settings' },
  { path: '/login', tab: Tab.HOME, component: lazy(() => import('@/features/auth/LoginView')), requiresAuth: false, title: 'Login' },
];

export function getRouteByTab(tab: Tab): RouteDefinition | undefined {
  return ROUTES.find(r => r.tab === tab);
}
