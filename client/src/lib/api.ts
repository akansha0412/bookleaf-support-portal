
const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export type ApiError = Error & {
  status?: number;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      'Cannot connect to the BookLeaf API. Check that the backend is running.',
    );
  }

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const body = result as {
      message?: string;
    } | null;

    const error = new Error(
      body?.message ?? `Request failed (${response.status})`,
    ) as ApiError;

    error.status = response.status;
    throw error;
  }

  return result as T;
}