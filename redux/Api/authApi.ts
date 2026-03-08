import { api } from "./baseApi";

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

interface ForgotPasswordCredentials {
  email: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    status: boolean;
    message: string;
  };
  errorSources?: Array<{
    path: string;
    message: string;
  }>;
  stack?: {
    statusCode: number;
  };
}

export const authApi = {
  loginAdmin: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<{
      accessToken: string;
      refreshToken: string;
    }>("/api/v1/auth/login_admin_account", credentials);

    // Construct the LoginResponse from the API response
    return {
      success: response.success,
      message: response.message,
      data: response.data || {
        accessToken: "",
        refreshToken: "",
      },
    };
  },

  forgotPassword: async (
    credentials: ForgotPasswordCredentials,
  ): Promise<ForgotPasswordResponse> => {
    const response = await api.post<any>(
      "/api/v1/user/forgot_password",
      credentials,
    );

    // Handle the response structure properly
    if (response.success) {
      return {
        success: response.success,
        message: response.message,
        data: response.data,
      };
    } else {
      return {
        success: response.success,
        message: response.message,
        errorSources: response.errorSources,
        stack: response.stack,
      };
    }
  },
};

export type {
  LoginCredentials,
  LoginResponse,
  ForgotPasswordCredentials,
  ForgotPasswordResponse,
};
export default authApi;
