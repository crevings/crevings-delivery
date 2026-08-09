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
  { path: '/', tab: Tab.HOME, component: lazy(() => import('@/features/dashboard/components/Dashboard')), requiresAuth: true, title: 'Dashboard' },
  { path: '/orders', tab: Tab.ORDERS, component: lazy(() => import('@/features/orders/components/OrdersView')), requiresAuth: true, title: 'Orders' },
  { path: '/order-history', tab: Tab.ORDER_HISTORY, component: lazy(() => import('@/features/orders/components/OrderHistoryView')), requiresAuth: true, title: 'Order History' },
  { path: '/earnings', tab: Tab.EARNINGS, component: lazy(() => import('@/features/earnings/components/EarningsView')), requiresAuth: true, title: 'Earnings' },
  { path: '/menu', tab: Tab.MENU, component: lazy(() => import('@/features/menu/components/MenuView')), requiresAuth: true, title: 'Menu' },
  { path: '/inventory', tab: Tab.INVENTORY, component: lazy(() => import('@/features/inventory/components/InventoryView')), requiresAuth: true, title: 'Inventory' },
  { path: '/profile', tab: Tab.PROFILE, component: lazy(() => import('@/features/profile/components/ProfileView')), requiresAuth: true, title: 'Profile' },
  { path: '/settings', tab: Tab.SETTINGS, component: lazy(() => import('@/features/settings/components/SettingsView')), requiresAuth: true, title: 'Settings' },
  { path: '/login', tab: Tab.HOME, component: lazy(() => import('@/features/auth/components/LoginView')), requiresAuth: false, title: 'Login' },
];

export function getRouteByTab(tab: Tab): RouteDefinition | undefined {
  return ROUTES.find(r => r.tab === tab);
}
