type QueryValue = string | number | boolean | null | undefined;
type Query = Record<string, QueryValue | QueryValue[]>;

export const buildQuery = (query?: Query) => {
	if (!query) return "";
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (Array.isArray(value)) {
			value.forEach((item) => {
				if (item === undefined || item === null) return;
				params.append(key, String(item));
			});
		} else if (value !== undefined && value !== null) {
			params.set(key, String(value));
		}
	}
	const serialized = params.toString();
	return serialized ? `?${serialized}` : "";
};

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
	const res = await fetch(url, {
		...options,
		credentials: options?.credentials ?? "include",
		headers: {
			"Content-Type": "application/json",
			...(options?.headers ?? {}),
		},
	});

	if (!res.ok) {
		const message = await res.text();
		throw new Error(message || `Request failed: ${res.status}`);
	}

	return res.json() as Promise<T>;
}
