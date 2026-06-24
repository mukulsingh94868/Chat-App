import axios, { type AxiosRequestConfig } from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

interface ApiRequestConfig extends AxiosRequestConfig {
  isFormData?: boolean;
  Authorization?: string;
}

export const apiRequest = async <T = unknown>(
  method: HttpMethod,
  endpoint: string,
  data: unknown = null,
  config: ApiRequestConfig = {},
): Promise<T> => {
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const formDataHeaders: Record<string, string> = {
    "Content-Type": "multipart/form-data",
  };

  const { isFormData, Authorization, ...requestConfig } = config;
  const headers: Record<string, string> = isFormData
    ? formDataHeaders
    : defaultHeaders;

  if (Authorization) {
    headers.Authorization = Authorization;
  }

  try {
    const requestConfigWithData =
      data === null ? requestConfig : { ...requestConfig, data };

    const response = await apiClient.request<T>({
      method,
      url: endpoint,
      headers,
      ...requestConfigWithData,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as T;
    }

    console.error(`${method.toUpperCase()} request failed:`, error);
    throw error;
  }
};

// Convenience methods for common requests
export const getData = <T = unknown>(
  endpoint: string,
  params: Record<string, unknown> = {},
  config: ApiRequestConfig = {},
) => apiRequest<T>("get", endpoint, null, { params, ...config });

export const postData = <T = unknown>(
  endpoint: string,
  data: unknown,
  config: ApiRequestConfig = {},
) => apiRequest<T>("post", endpoint, data, config);

export const putData = <T = unknown>(
  endpoint: string,
  data: unknown,
  config: ApiRequestConfig = {},
) => apiRequest<T>("put", endpoint, data, config);

export const patchData = <T = unknown>(
  endpoint: string,
  data: unknown,
  config: ApiRequestConfig = {},
) => apiRequest<T>("patch", endpoint, data, config);

export const deleteData = <T = unknown>(
  endpoint: string,
  params: Record<string, unknown> = {},
  config: ApiRequestConfig = {},
) => apiRequest<T>("delete", endpoint, null, { params, ...config });
