export interface OrderStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
}

export interface OrderItem {
  name: string;
  quantity: number;
  size?: string;
  addOns?: string[];
  note?: string;
  price?: number;
}

export interface Order {
  id: string;
  orderId?: string;
  displayOrderNumber?: string;
  displayOrderId?: string;
  customer: string;
  customerName?: string;
  type: 'Delivery' | 'Offline Orders' | 'Dine-in' | 'Table Booking' | 'Takeaway' | 'Customer Tips';
  tableNumber?: string;
  tableNo?: string;
  pax?: number;
  channel: string;
  items: string;
  itemList?: OrderItem[];
  total: string;
  status: string;
  time: string;
  paymentStatus?: 'Paid' | 'Unpaid' | 'Refunded';
  paymentMethod?: string;
  address?: string;
  /** Pickup restaurant name (dispatch popup / trip screen). */
  restaurantName?: string;
  /** Pickup restaurant street address, when known. */
  restaurantAddress?: string;
  /** Pickup restaurant phone, when known (trip screen Call button). */
  restaurantPhone?: string;
  /** Pickup restaurant coordinates { lat, lng } for accurate turn-by-turn map navigation. */
  restaurantCoordinates?: { lat: number; lng: number } | null;
  /** Customer delivery coordinates { lat, lng } for accurate turn-by-turn map navigation. */
  customerCoordinates?: { lat: number; lng: number } | null;
  /** Distance from the driver to the pickup restaurant, in km (dispatch popup). */
  pickupDistanceKm?: string;
  /** Delivery fee the customer paid — the driver's earnings for this trip. */
  deliveryFee?: number;
  /** Earnings credited to the driver once the order is completed. */
  driverEarnings?: number;
  customerType?: 'Regular' | 'First Time' | 'Inactive';
  phone?: string;
  offer?: string;
  customerNote?: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
}

export interface Booking {
  id: string;
  customer: string;
  phone: string;
  time: string;
  date: string;
  guests: number;
  tableCount: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  type: 'Table Booking' | 'Table Booking with Food' | 'Booking Package';
  source: string;
  preOrderItems?: { name: string; quantity: number }[];
  packageInfo?: string;
}
