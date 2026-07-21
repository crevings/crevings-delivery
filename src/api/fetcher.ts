export const BASE_URL = (((import.meta as any).env?.VITE_PUBLIC_BASE_API_URL) || "http://127.0.0.1:42007") + "/api";

export class ResponseError extends Error {
  response: Response;
  status: number;
  info: any;

  constructor(message: string, response: Response, info: any) {
    super(message);
    this.name = "ResponseError";
    this.response = response;
    this.status = response.status;
    this.info = info;
  }
}

export const fetcher = async (url: string) => {
  const absoluteUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  
  const token = localStorage.getItem("delivery_token");

  const res = await fetch(absoluteUrl, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    let info;
    try {
      info = await res.json();
    } catch {
      info = { message: "Failed to parse error response" };
    }
    throw new ResponseError(
      "An error occurred while fetching data.",
      res,
      info
    );
  }

  return res.json();
};
