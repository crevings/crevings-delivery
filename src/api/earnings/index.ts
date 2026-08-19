import useSWR from "swr";
import { fetcher } from "../fetcher";
import { SWR_HOT } from "../swrConfig";

export interface EarningsPeriod {
  earnings: number;
  trips: number;
}

export interface EarningsSummary {
  today: EarningsPeriod;
  week: EarningsPeriod;
  month: EarningsPeriod;
  allTime: EarningsPeriod;
  balance: number;
}

/**
 * Driver earnings summary — `GET /delivery/wallet/earnings` (implemented in
 * the backend: today / week / month / all-time earnings + trip counts from
 * the driver's wallet ledger, plus the current balance).
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