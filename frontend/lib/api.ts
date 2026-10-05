const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

const STORAGE_KEY = "careerpilot.auth";

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const session = JSON.parse(raw);

    return session?.token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const token = getToken();

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const url = `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });

    const contentType =
      response.headers.get(
        "content-type",
      ) || "";

    const payload =
      contentType.includes(
        "application/json",
      )
        ? await response.json()
        : await response.text();

    if (!response.ok) {
      const detail =
        typeof payload === "object" &&
        payload !== null
          ? payload.detail ||
            payload.message ||
            payload.error
          : payload;

      throw new Error(
        typeof detail === "string"
          ? detail
          : `Request failed with HTTP ${response.status}.`,
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Backend request failed. Unable to connect to ${API_BASE_URL}.`,
      );
    }

    throw error;
  }
}

export { API_BASE_URL };