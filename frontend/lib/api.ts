// Browser calls only the API Gateway (port 4000), never the individual services.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// The services wrap every response as { statusCode, message, data }; this returns `data`.
export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
  } catch {
    throw new Error('Cannot connect to API Gateway. Is port 4000 running?');
  }
  const body = await response.json();
  if (!response.ok) {
    const message = body?.message;
    throw new Error(Array.isArray(message) ? message.join(', ') : message || 'Request failed');
  }
  return body.data as T;
}
