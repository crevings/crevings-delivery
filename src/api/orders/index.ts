import { useMemo } from "react";
import useSWR from "swr";
import { fetcher, patch, post } from "../fetcher";
import { SWR_HOT, SWR_LIVE } from "../swrConfig";
import type { Order } from "@/types";

export const useActiveOrders = () => {
  const { data, error, isLoading, mutate } = useSWR<{ success?: boolean; orders?: Order[] }>(
    "/delivery/orders/active",
    fetcher,
    {
      revalidateOnMount: true,
      // Keep the driver's active list fresh dynamically in real-time
      refreshInterval: 3000,
      ...SWR_LIVE,
    }
  );

  // Memoize so the array reference is stable across renders (a fresh `[]`
  // every render would re-trigger any useEffect that syncs on it).
  const orders = useMemo(
    () => (Array.isArray(data) ? data : (data?.orders || [])),
    [data]
  );

  return {
    activeOrders: orders,
    isLoading,
    isError: error,
    mutate,
  };
};

/** Map a backend status to the app's display vocabulary (OrderCard). */
const DRIVER_STATUS_LABELS: Record<string, string> = {
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready",
  READY_FOR_PICKUP: "Ready",
  DRIVER_ASSIGNED: "Ready",
  DRIVER_ARRIVED: "Out for Delivery",
  "OUT FOR DELIVERY": "Out for Delivery",
  REACHED_CUSTOMER: "Out for Delivery",
  COMPLETED: "Delivered",
  DELIVERED: "Delivered",
};

export const mapDriverStatus = (status?: string): string => {
  const s = (status || "").toUpperCase();
  return DRIVER_STATUS_LABELS[s] || s;
};

/**
 * Map a raw backend active-order document into the app's Order shape, so the
 * dashboard cards and the Orders tab can render backend-assigned trips.
 */
export const mapActiveOrder = (raw: any): Order => ({
  id: raw.orderId,
  orderId: raw.orderId,
  displayOrderNumber: raw.displayOrderNumber,
  displayOrderId: raw.displayOrderId,
  customer: raw.customerDetails?.name || "Customer",
  type: "Delivery",
  channel: raw.channel || "Crevings",
  items:
    (raw.items || []).map((it: any) => `${it.quantity} x ${it.name}`).join(", ") ||
    "Delivery Order",
  itemList: (raw.items || []).map((it: any) => ({
    name: it.name,
    quantity: it.quantity,
    price: it.price,
  })),
  total: String(raw.total ?? "0"),
  status: mapDriverStatus(raw.status),
  time: raw.dispatchTime
    ? new Date(raw.dispatchTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : raw.createdAt
      ? new Date(raw.createdAt).toLocaleString([], {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--",
  paymentStatus: raw.payment?.status === "Paid" ? "Paid" : "Unpaid",
  paymentMethod: raw.payment?.method || "",
  address: raw.customerDetails?.address || "",
  restaurantName: raw.restaurantName || undefined,
  restaurantAddress: raw.restaurantAddress || "",
  restaurantPhone: raw.restaurantPhone || "",
  deliveryFee: Number(raw.deliveryFee ?? 0),
  driverEarnings: Number(raw.driverEarnings ?? 0),
  customerType: "Regular",
  phone: raw.customerDetails?.phone || "",
  customerNote: raw.customerDetails?.note || raw.deliveryNotes || "",
  offer: raw.appliedOffer || "",
  subtotal: raw.subtotal || 0,
  tax: raw.tax || 0,
  discount: raw.discount || 0,
});

/**
 * Driver order history — `GET /delivery/orders/history?limit=&cursor=`
 * (implemented in the backend; cursor-paginated, newest first). The backend
 * returns raw order docs; callers map them with mapActiveOrder.
 */
export const useOrderHistory = (limit: number = 20, cursor?: string) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);

  const { data, error, isLoading, mutate } = useSWR<
    { success?: boolean; orders?: any[]; nextCursor?: string | null; hasMore?: boolean }
  >(`/delivery/orders/history?${params.toString()}`, fetcher, {
    revalidateOnMount: true,
    ...SWR_HOT,
  });

  return {
    orderHistory: (data?.orders || []).map(mapActiveOrder),
    nextCursor: data?.nextCursor || null,
    hasMore: data?.hasMore || false,
    isLoading,
    isError: error,
    mutate,
  };
};

/**
 * Map a raw backend available-order payload into the app's Order shape
 * (single source of truth — previously inlined in Dashboard's poll loop).
 */
export const mapAvailableOrder = (raw: any): Order => ({
  id: raw.orderId,
  orderId: raw.orderId,
  displayOrderNumber: raw.displayOrderNumber,
  displayOrderId: raw.displayOrderId,
  customer: raw.customerDetails?.name || "Customer",
  type: "Customer Tips",
  channel: "Direct",
  items: `${raw.items?.length || 1} Items`,
  itemList: (raw.items || []).map((it: any) => ({
    name: it.name,
    quantity: it.quantity,
    price: it.price,
  })),
  paymentStatus: raw.payment?.status === "Paid" ? "Paid" : (raw.payment?.method === "COD" || raw.payment?.method === "Cash" ? "Unpaid" : (raw.payment?.status || "Paid")),
  paymentMethod: raw.payment?.method || (raw.isCOD ? "COD" : "Online"),
  address: raw.customerDetails?.address || "Customer Address",
  restaurantName: raw.restaurantName || raw.branchName || undefined,
  restaurantAddress: raw.restaurantAddress || "",
  restaurantPhone: raw.restaurantPhone || "",
  pickupDistanceKm: raw.pickupDistanceKm || undefined,
  deliveryFee: Number(raw.deliveryFee ?? 30),
  driverEarnings: Number(raw.deliveryFee ?? raw.driverEarnings ?? 30),
  subtotal: raw.subtotal || 0,
  tax: raw.tax || 0,
  discount: raw.discount || 0,
  total: String(raw.total || "0"),
  status: "Incoming",
  time: "--",
  customerType: "Regular",
  phone: raw.customerDetails?.phone || "+91 98765 43210",
  customerNote: "",
  offer: raw.appliedOffer || "",
});

/**
 * Driver availability feed — SWR-driven replacement for the raw fetch poll.
 * Polls while the driver is online (the key becomes null when offline so no
 * request fires), dedupes concurrent mounts via the global dedupingInterval,
 * and serves the cached snapshot between polls so the UI never flashes empty.
 * Returns the FIRST available order mapped to the app's Order shape (the
 * current driver flow handles one pickup at a time).
 */
export const useAvailableOrders = (isOnline: boolean, pollIntervalMs = 3000) => {
  const { data, error, mutate } = useSWR<{ success?: boolean; orders?: any[] } | null>(
    isOnline ? "/delivery/orders/available" : null,
    fetcher,
    {
      revalidateOnMount: true,
      refreshInterval: pollIntervalMs,
      ...SWR_LIVE,
    }
  );

  const raw = data?.orders?.[0];
  return {
    availableOrder: raw ? mapAvailableOrder(raw) : null,
    isError: error,
    mutate,
  };
};

/** Accept a dispatch order. Sends an empty JSON body (Fastify rejects an empty body). */
export const acceptOrder = (orderId: string) =>
  post<{ success?: boolean }>(`/delivery/orders/${orderId}/accept`, {});

/** Send the driver's ACCEPT/DECLINE response to the dispatch workflow. */
export const respondToDispatch = (
  orderId: string,
  action: "ACCEPT" | "DECLINE",
  reason?: string
) =>
  post<{ success?: boolean }>(`/delivery/orders/${orderId}/respond`, {
    action,
    reason: reason || "User declined",
  });

export const updateOrderStatus = (orderId: string, status: string) =>
  patch(`/delivery/orders/${orderId}/status`, { status });
