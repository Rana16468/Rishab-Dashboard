import { api } from "../baseApi";

const privacyPolicyApi = {
  createPrivacyPolicy: async (data: any): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    const response = await api.post<any>(
      "/api/v1/setting/privacy_policys",
      data,
    );
    return response;
  },

  getPrivacyPolicy: async (): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    try {
      const response = await api.get<any>("/api/v1/setting/privacy_policys");
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default privacyPolicyApi;
