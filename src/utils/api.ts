'use client';

export type ApiFetchOptions = RequestInit & {
  responseType?: 'json' | 'blob';
};

export async function apiFetch<T>(
  baseUrl: string,
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const url = `${baseUrl}/${endpoint}`;
  const { responseType = 'json', ...fetchOptions } = options;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  };

  if (fetchOptions.body instanceof FormData) {
    delete (headers as Record<string, string>)['Content-Type'];
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.statusText} (${response.status})`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // Fallback
    }
    throw new Error(errorMessage);
  }

  if (responseType === 'blob') {
    return (await response.blob()) as unknown as T;
  }

  return response.json() as Promise<T>;
}
