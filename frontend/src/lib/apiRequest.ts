type TokenGetter = () => Promise<string>;
type ApiRequestOptions = RequestInit & { requiresAuth?: boolean };

let getToken: TokenGetter | undefined;

export function configureApi(tokenGetter: TokenGetter): void {
  console.log("Configuring API with token");
  getToken = tokenGetter;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { requiresAuth = true, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);

  if (requiresAuth) {
    if (!getToken) {
      throw new Error("Auth0 token getter is not configured");
    }
    const token = await getToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiRequest = {
  get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "GET",
      headers: {
        Accept: "application/json",
        ...options?.headers,
      },
    });
  },

  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  postFormData<T>(
    path: string,
    body: FormData,
    options?: ApiRequestOptions,
  ): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "POST",
      headers: {
        Accept: "application/json",
        ...options?.headers,
      },
      body,
    });
  },

  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      headers: {
        Accept: "application/json",
        ...options?.headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patchFormData<T>(
    path: string,
    body: FormData,
    options?: ApiRequestOptions,
  ): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      headers: {
        Accept: "application/json",
        ...options?.headers,
      },
      body,
    });
  },

  delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
    });
  },
};
