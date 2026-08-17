import React from 'react';

/**
 * Driver-app tabs — pruned from the ~60-value restaurant-partner enum that
 * was copied into this app. Only tabs referenced by the app's navigation and
 * views remain.
 */
export enum Tab {
  HOME = 'HOME',
  ORDERS = 'ORDERS',
  ORDER_HISTORY = 'ORDER_HISTORY',
  EARNINGS = 'EARNINGS',
  MENU = 'MENU',
  INVENTORY = 'INVENTORY',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  PROFILE_DETAILS = 'PROFILE_DETAILS',
  VEHICLE_DETAILS = 'VEHICLE_DETAILS',
  PERSONAL_DOCUMENTS = 'PERSONAL_DOCUMENTS',
  BANK_ACCOUNTS = 'BANK_ACCOUNTS',
}

export interface NavItem {
  id: Tab;
  label: string;
  icon: React.FC<any>;
}
