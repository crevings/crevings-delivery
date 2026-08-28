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
  { path: '/payout', tab: Tab.PAYOUT, component: lazy(() => import('@/features/earnings/EarningsView').then(m => ({ default: m.EarningsView }))), requiresAuth: true, title: 'Payout' },
  { path: '/inventory', tab: Tab.INVENTORY, component: lazy(() => import('@/features/inventory/InventoryView').then(m => ({ default: m.InventoryView }))), requiresAuth: true, title: 'Inventory' },
  { path: '/profile', tab: Tab.PROFILE, component: lazy(() => import('@/features/profile/ProfileView').then(m => ({ default: m.ProfileView }))), requiresAuth: true, title: 'Profile' },
  { path: '/profile/details', tab: Tab.PROFILE_DETAILS, component: lazy(() => import('@/components/ProfileDetailsView').then(m => ({ default: m.ProfileDetailsView }))), requiresAuth: true, title: 'Profile Details' },
  { path: '/profile/vehicle', tab: Tab.VEHICLE_DETAILS, component: lazy(() => import('@/components/VehicleDetailsView').then(m => ({ default: m.VehicleDetailsView }))), requiresAuth: true, title: 'Vehicle Details' },
  { path: '/profile/documents', tab: Tab.PERSONAL_DOCUMENTS, component: lazy(() => import('@/components/PersonalDocumentsView').then(m => ({ default: m.PersonalDocumentsView }))), requiresAuth: true, title: 'Personal Documents' },
  { path: '/profile/bank', tab: Tab.BANK_ACCOUNTS, component: lazy(() => import('@/components/BankAccountView').then(m => ({ default: m.BankAccountView }))), requiresAuth: true, title: 'Bank Accounts' },
  { path: '/invoices', tab: Tab.INVOICES, component: lazy(() => import('@/components/InvoicesView').then(m => ({ default: m.InvoicesView }))), requiresAuth: true, title: 'Invoices' },
  { path: '/store', tab: Tab.PARTNER_STORE, component: lazy(() => import('@/components/PartnerStoreView').then(m => ({ default: m.PartnerStoreView }))), requiresAuth: true, title: 'Partner Store' },
  { path: '/store/checkout', tab: Tab.PARTNER_STORE_CHECKOUT, component: lazy(() => import('@/components/PartnerStoreCheckoutView').then(m => ({ default: m.PartnerStoreCheckoutView }))), requiresAuth: true, title: 'Store Checkout' },
  { path: '/store/tracking', tab: Tab.PARTNER_STORE_TRACKING, component: lazy(() => import('@/components/PartnerStoreTrackingView').then(m => ({ default: m.PartnerStoreTrackingView }))), requiresAuth: true, title: 'Track Store Order' },
  { path: '/notifications', tab: Tab.NOTIFICATIONS, component: lazy(() => import('@/components/NotificationsView').then(m => ({ default: m.NotificationsView }))), requiresAuth: true, title: 'Notifications' },
  { path: '/settings', tab: Tab.SETTINGS, component: lazy(() => import('@/features/settings/SettingsView').then(m => ({ default: m.SettingsView }))), requiresAuth: true, title: 'Settings' },
  { path: '/support', tab: Tab.SUPPORT, component: lazy(() => import('@/components/SupportView').then(m => ({ default: m.SupportView }))), requiresAuth: true, title: 'Support' },
  { path: '/studio', tab: Tab.CREVINGS_STUDIO, component: lazy(() => import('@/components/CrevingsStudioView').then(m => ({ default: m.CrevingsStudioView }))), requiresAuth: true, title: 'Crevings Studio' },
  { path: '/legal', tab: Tab.CREVINGS_LEGAL, component: lazy(() => import('@/components/CrevingsLegalView').then(m => ({ default: m.CrevingsLegalView }))), requiresAuth: true, title: 'Crevings Legal' },
  { path: '/pin-on-map', tab: Tab.PIN_ON_MAP, component: lazy(() => import('@/components/PinOnMapView').then(m => ({ default: m.PinOnMapView }))), requiresAuth: true, title: 'Pin On Map' },
  { path: '/sales-report', tab: Tab.SALES_REPORT, component: lazy(() => import('@/components/SalesReportView').then(m => ({ default: m.SalesReportView }))), requiresAuth: true, title: 'Sales Report' },
  { path: '/refunds', tab: Tab.REFUNDS, component: lazy(() => import('@/components/RefundsView').then(m => ({ default: m.RefundsView }))), requiresAuth: true, title: 'Refunds' },
  { path: '/customer-data', tab: Tab.CUSTOMER_DATA, component: lazy(() => import('@/components/CustomerDataView').then(m => ({ default: m.CustomerDataView }))), requiresAuth: true, title: 'Customer Data' },
  { path: '/analytics', tab: Tab.ANALYTICS, component: lazy(() => import('@/components/AnalyticsView').then(m => ({ default: m.AnalyticsView }))), requiresAuth: true, title: 'Analytics' },
  { path: '/integrations', tab: Tab.INTEGRATIONS, component: lazy(() => import('@/components/IntegrationsView').then(m => ({ default: m.IntegrationsView }))), requiresAuth: true, title: 'Integrations' },
  { path: '/subscription', tab: Tab.SUBSCRIPTION, component: lazy(() => import('@/components/SubscriptionView').then(m => ({ default: m.SubscriptionView }))), requiresAuth: true, title: 'Subscription' },
  { path: '/menu', tab: Tab.MENU, component: lazy(() => import('@/components/MenuView').then(m => ({ default: m.MenuView }))), requiresAuth: true, title: 'Menu' },
  { path: '/offers', tab: Tab.OFFERS, component: lazy(() => import('@/components/OffersView').then(m => ({ default: m.OffersView }))), requiresAuth: true, title: 'Offers' },
  { path: '/create-offer', tab: Tab.CREATE_OFFER, component: lazy(() => import('@/components/CreateOfferView').then(m => ({ default: m.CreateOfferView }))), requiresAuth: true, title: 'Create Offer' },
  { path: '/create-order', tab: Tab.CREATE_ORDER, component: lazy(() => import('@/components/CreateOrderView').then(m => ({ default: m.CreateOrderView }))), requiresAuth: true, title: 'Create Order' },
  { path: '/login', tab: Tab.HOME, component: lazy(() => import('@/features/auth/LoginView')), requiresAuth: false, title: 'Login' },
  { path: '/onboarding', tab: Tab.HOME, component: lazy(() => import('@/components/OnboardingView').then(m => ({ default: m.OnboardingView }))), requiresAuth: false, title: 'Onboarding' },
];

export function getRouteByTab(tab: Tab): RouteDefinition | undefined {
  return ROUTES.find(r => r.tab === tab);
}
