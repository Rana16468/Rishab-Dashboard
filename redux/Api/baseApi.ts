const BASE_URL =
  "https://different-leonard-springfield-orlando.trycloudflare.com";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  [key: string]: any;
}

interface RequestOptions {
  headers?: Record<string, string>;
  [key: string]: any;
}

export const api = {
  baseURL: BASE_URL,

  // Generic request method
  request: async <T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> => {
    const url = `${BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  },

  // HTTP methods
  get: <T = any>(endpoint: string, options: RequestOptions = {}) =>
    api.request<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, data: any, options: RequestOptions = {}) =>
    api.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T = any>(endpoint: string, data: any, options: RequestOptions = {}) =>
    api.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),
  
  patch: <T = any>(endpoint: string, data: any, options: RequestOptions = {}) =>
    api.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T = any>(endpoint: string, options: RequestOptions = {}) =>
    api.request<T>(endpoint, { ...options, method: "DELETE" }),
};

export default api;
