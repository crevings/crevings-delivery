export const APP_NAME = 'CREVINGS DELIVERY PARTNER';
export const APP_VERSION = '1.0.0';

export const LOCATION_TRACKING_INTERVAL = 5000;
export const ORDER_STREAM_RECONNECT_DELAY = 3000;
export const ORDER_POLL_INTERVAL = 20000;
export const AUTH_TOKEN_KEY = 'delivery_token';
export const REFRESH_TOKEN_KEY = 'delivery_refresh_token';

export const PERMISSIONS = {
  LOCATION: 'location',
  MICROPHONE: 'microphone',
  NOTIFICATION: 'notification',
  CONTACT: 'contact',
} as const;

export const ORDER_STATUS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  PICKED_UP: 'Picked Up',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
} as const;

export const ORDER_TYPES = {
  DELIVERY: 'Delivery',
  DINE_IN: 'Dine-in',
  TAKEAWAY: 'Takeaway',
  OFFLINE: 'Offline Orders',
  TABLE_BOOKING: 'Table Booking',
} as const;

export const PAYMENT_STATUS = {
  PAID: 'Paid',
  UNPAID: 'Unpaid',
  REFUNDED: 'Refunded',
} as const;

export const CUSTOMER_TYPES = {
  REGULAR: 'Regular',
  FIRST_TIME: 'First Time',
  INACTIVE: 'Inactive',
} as const;
