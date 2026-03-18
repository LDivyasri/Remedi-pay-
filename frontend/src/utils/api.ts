export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Debug helper: log base URL once in dev to confirm env is loaded
if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
  // eslint-disable-next-line no-console
  console.log('API_BASE_URL =', API_BASE_URL);
}

function getAuthHeader(token?: string | null) {
  if (!token) return {} as Record<string, string>;
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
  });
  if (!res.ok) throw new Error((await res.text()) || 'Request failed');
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body: any, token?: string | null): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Request failed');
  return (await res.json()) as T;
}

export async function apiPut<T>(path: string, body: any, token?: string | null): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Request failed');
  return (await res.json()) as T;
}

export async function apiDelete<T = any>(path: string, token?: string | null): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
  });
  if (!res.ok) throw new Error((await res.text()) || 'Request failed');
  return (await res.json()) as T;
}

export async function apiPostForm<T>(path: string, formData: FormData, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { ...getAuthHeader(token) };
  // Do not set Content-Type for FormData; browser will add correct boundary
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }
  return (await res.json()) as T;
}

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


