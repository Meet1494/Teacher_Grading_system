import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // For debugging
  console.log(`Making ${method} request to ${url}`);
  
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Always include credentials for cookie-based auth
  });

  if (method === 'POST' && (url === '/api/login' || url === '/api/register')) {
    console.log('Auth response status:', res.status);
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    let fullUrl = url;
    
    // Check if there are query parameters to add
    if (queryKey.length > 1 && typeof queryKey[1] === 'object') {
      const params = new URLSearchParams();
      const queryParams = queryKey[1] as Record<string, any>;
      
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      
      const queryString = params.toString();
      if (queryString) {
        fullUrl = `${url}?${queryString}`;
      }
    }
    
    console.log(`Fetching data from ${url} with full URL: ${fullUrl}`);
    
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log(`Response status from ${url}: ${res.status}`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log(`Returning null for unauthorized request to ${url}`);
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
