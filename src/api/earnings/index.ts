import useSWR from "swr";
import { fetcher } from "../fetcher";
import { SWR_HOT } from "../swrConfig";

export interface EarningsPeriod {
  earnings: number;
  trips: number;
  ordersEarning?: number;
  tips?: number;
  incentive?: number;
  bonus?: number;
}

export interface EarningsSummary {
  today: EarningsPeriod;
  last3Days?: EarningsPeriod;
  last7Days?: EarningsPeriod;
  last14Days?: EarningsPeriod;
  week: EarningsPeriod;
  month: EarningsPeriod;
  lastMonth?: EarningsPeriod;
  allTime: EarningsPeriod;
  balance: number;
}

/**
 * Driver earnings summary — `GET /delivery/wallet/earnings` (today, last 3/7/14 days,
 * week, month, last month, all-time earnings + trip counts from the driver's wallet ledger,
 * plus current balance).
 */
export const useEarningsSummary = () => {
  const { data, error, isLoading, mutate } = useSWR<EarningsSummary>(
    "/delivery/wallet/earnings",
    fetcher,
    {
      revalidateOnMount: true,
      ...SWR_HOT,
    }
  );

  return {
    earnings: data,
    isLoading,
    isError: error,
    mutate,
  };
};