import { api, BASE_URL } from "./baseApi";

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    status?: boolean;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
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

interface UpdateProfileData {
  name: string;
  nickname: string;
  language: string[];
  hobbies: string[];
  age: string;
}

interface VerifyUserPayload {
  verificationCode: number;
}

interface VerifyUserResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    accessToken: string;
  };
  errorSources?: Array<{
    path: string;
    message: string;
  }>;
  // Expose accessToken directly for convenience since authApi returns response.data
  accessToken: string;
}

export const authApi = {
  loginAdmin: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<any>(
      "/api/v1/auth/login_admin_account",
      credentials,
    );

    // Construct the LoginResponse from the API response
    return {
      success: response.success,
      message: response.message,
      data: response.data || {
        status: false,
        message: "",
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

  verifyCode: async (code: string): Promise<any> => {
    const response = await api.post<any>(
      "/api/v1/user/verification_forgot_user",
      {
        verificationCode: parseInt(code, 10),
      },
    );
    return response;
  },

  verifyUser: async (
    payload: VerifyUserPayload,
  ): Promise<VerifyUserResponse> => {
    let response = await api.patch<VerifyUserResponse>(
      "/api/v1/user/user_verification",
      payload,
    );

    if (!response.data) {
      throw new Error("Invalid response from verifyUser API");
    }

    // Map nested accessToken to top-level for convenience
    const result: VerifyUserResponse = {
      ...response.data,
      accessToken: response.data.accessToken,
    };

    return result;
  },

  resetPassword: async (password: string): Promise<any> => {
    const resetToken = localStorage.getItem("resetToken");

    // Get user ID from decoded token
    let userId = null;
    try {
      if (resetToken) {
        const tokenParts = resetToken.split(".");

        if (tokenParts.length === 3) {
          const payload = atob(tokenParts[1]);
          const decodedToken = JSON.parse(payload);
          userId = decodedToken.id;
        } else {
        }
      }
    } catch (error) {
      //
    }

    if (!userId) {
      throw new Error("Unable to extract user ID from token");
    }

    const response = await api.post<any>("/api/v1/user/reset_password", {
      userId,
      password,
    });
    return response;
  },

  changePassword: async (
    oldPassword: string,
    newPassword: string,
  ): Promise<any> => {
    const token = localStorage.getItem("token");

    // Try different endpoints to find the correct one
    const endpoints = ["/api/v1/user/change_password"];

    let lastError;
    for (const endpoint of endpoints) {
      try {
        const response = await api.patch<any>(endpoint, {
          oldpassword: oldPassword,
          newpassword: newPassword,
        });

        return response;
      } catch (error: any) {
        lastError = error;
        continue;
      }
    }

    throw lastError || new Error("All endpoints failed");
  },

  myProfile: async (): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    const response = await api.get<any>("/api/v1/auth/myprofile");
    return response;
  },

  updateMyProfile: async (
    data: UpdateProfileData,
    file?: File,
  ): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (file) {
      formData.append("file", file);
    }

    const response = await fetch(`${BASE_URL}/api/v1/auth/update_my_profile`, {
      method: "PATCH",
      headers: {
        Authorization: `${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },
};

export type {
  LoginCredentials,
  LoginResponse,
  ForgotPasswordCredentials,
  ForgotPasswordResponse,
  UpdateProfileData,
  VerifyUserPayload,
  VerifyUserResponse,
};
export default authApi;
