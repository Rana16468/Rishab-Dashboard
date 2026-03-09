import { api } from "../baseApi";

const aboutUsApi = {
  createAbout: async (data: any): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    const response = await api.post<any>("/api/v1/setting/about", data);
    return response;
  },

  getAbout: async (): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    try {
      const response = await api.get<any>("/api/v1/setting/find_by_about_us");
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default aboutUsApi;
