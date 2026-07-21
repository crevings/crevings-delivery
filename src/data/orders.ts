import { Order } from "@/types";

export const INITIAL_ORDERS: Order[] = [
  { 
    id: 'ORD-011', 
    time: '12:43', 
    customer: 'Simran Kaur', 
    items: '1 Item • Large Pepperoni Pizza', 
    itemList: [{ name: 'Large Pepperoni Pizza', quantity: 1 }], 
    total: '899.00', 
    channel: 'Crevings', 
    status: 'Preparing', 
    type: 'Delivery', 
    paymentStatus: 'Paid' 
  },
  { 
    id: 'ORD-012', 
    time: '32:15', 
    customer: 'Rahul Dravid', 
    items: '2 Items • Veg Burger Meal', 
    itemList: [{ name: 'Veg Burger', quantity: 1 }, { name: 'Fries', quantity: 1 }], 
    total: '450.00', 
    channel: 'Zomato', 
    status: 'Cooking', 
    type: 'Delivery', 
    paymentStatus: 'Paid' 
  }
];

export const INITIAL_PAST_ORDERS: Order[] = [
  { 
    id: 'ORD-009', 
    time: 'Yesterday', 
    customer: 'Aarav Sharma', 
    items: '3 Items • Chicken Biryani', 
    itemList: [{ name: 'Chicken Biryani', quantity: 1 }], 
    total: '620.00', 
    channel: 'Crevings', 
    status: 'Delivered', 
    type: 'Delivery', 
    paymentStatus: 'Paid' 
  }
];
