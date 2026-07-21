import useSWR from "swr";
import { fetcher } from "../fetcher";

export interface EarningsSummary {
  todayEarnings: number;
  weeklyEarnings: number;
  totalTrips: number;
  onlineHours: number;
}

const DEFAULT_EARNINGS: EarningsSummary = {
  todayEarnings: 1450.00,
  weeklyEarnings: 8900.00,
  totalTrips: 18,
  onlineHours: 7.5,
};

export const useEarningsSummary = () => {
  const { data, error, isLoading, mutate } = useSWR<EarningsSummary>(
    "/delivery/earnings/summary",
    fetcher,
    {
      fallbackData: DEFAULT_EARNINGS,
      revalidateOnMount: true,
      revalidateOnFocus: false,
    }
  );

  return {
    earnings: data || DEFAULT_EARNINGS,
    isLoading,
    isError: error,
    mutate,
  };
};
