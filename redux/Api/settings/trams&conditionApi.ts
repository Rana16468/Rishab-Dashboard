import { api } from "../baseApi";

const termsAndConditionApi = {
  createTermsAndCondition: async (data: any): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    const response = await api.post<any>(
      "/api/v1/setting/terms_conditions",
      data,
    );
    return response;
  },

  getTermsAndCondition: async (): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    try {
      const response = await api.get<any>(
        "/api/v1/setting/find_by_terms_conditions",
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default termsAndConditionApi;
