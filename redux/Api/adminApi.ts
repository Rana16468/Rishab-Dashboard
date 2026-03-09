import { api } from "./baseApi";

const adminApi = {
  createAdminAccount: async (adminData: any): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    const response = await api.post<any>(
      "/api/v1/user/create_admin_account",
      adminData,
    );
    return response;
  },
};

export default adminApi;
