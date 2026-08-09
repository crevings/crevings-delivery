import { SWRConfig } from 'swr';

const fetcher = async (url: string) => {
  const token = sessionStorage.getItem('delivery_auth_token');
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.') as any;
    error.status = response.status;
    error.info = await response.json().catch(() => ({}));
    throw error;
  }

  return response.json();
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 1000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
