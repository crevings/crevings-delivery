import useSWR from "swr";
import { fetcher } from "../fetcher";
import { SWR_HOT } from "../swrConfig";

export interface EarningsSummary {
  todayEarnings: number;
  weeklyEarnings: number;
  totalTrips: number;
  onlineHours: number;
}

// NOTE: hardcoded placeholder until the backend exposes a real earnings
// endpoint — flagged in the architectural audit (useEarningsSummary is
// currently unwired; EarningsView is static mock UI).
const DEFAULT_EARNINGS: EarningsSummary = {
  todayEarnings: 1450.0,
  weeklyEarnings: 8900.0,
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
      ...SWR_HOT,
    }
  );

  return {
    earnings: data || DEFAULT_EARNINGS,
    isLoading,
    isError: error,
    mutate,
  };
};
