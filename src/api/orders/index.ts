import useSWR from "swr";
import { Order } from "@/types";
import { fetcher, BASE_URL } from "../fetcher";
import { INITIAL_ORDERS, INITIAL_PAST_ORDERS } from "@/data/orders";

export const useActiveOrders = () => {
  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    "/delivery/orders/active",
    fetcher,
    {
      fallbackData: INITIAL_ORDERS,
      revalidateOnMount: true,
      revalidateOnFocus: false,
    }
  );

  return {
    activeOrders: data || INITIAL_ORDERS,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useOrderHistory = () => {
  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    "/delivery/orders/history",
    fetcher,
    {
      fallbackData: INITIAL_PAST_ORDERS,
      revalidateOnMount: true,
      revalidateOnFocus: false,
    }
  );

  return {
    orderHistory: data || INITIAL_PAST_ORDERS,
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
      Authorization: `Bearer ${localStorage.getItem("delivery_token") || ""}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update order status");
  }
  return data;
};
