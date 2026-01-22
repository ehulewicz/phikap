const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

export const apiFetch = async <T>(path: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage =
      typeof errorBody?.error === "string" ? errorBody.error : "Request failed";
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
};
