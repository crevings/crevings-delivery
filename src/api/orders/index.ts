import useSWR from "swr";
import { Order } from "@/types";
import { fetcher, BASE_URL } from "../fetcher";
import { INITIAL_ORDERS, INITIAL_PAST_ORDERS } from "@/data/orders";

export const useActiveOrders = () => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    "/delivery/orders/active",
    fetcher,
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
    }
  );

  const orders = Array.isArray(data) ? data : (data?.orders || []);

  return {
    activeOrders: orders,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useOrderHistory = () => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    "/delivery/orders/history",
    fetcher,
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
    }
  );

  const orders = Array.isArray(data) ? data : (data?.orders || []);

  return {
    orderHistory: orders,
    isLoading,
    isError: error,
    mutate,
  };
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await fetch(`${BASE_URL}/delivery/orders/${orderId}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update order status");
  }
  return data;
};
