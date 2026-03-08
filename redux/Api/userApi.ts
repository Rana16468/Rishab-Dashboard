import { api } from "./baseApi";

export const userApi = {
  findAllUsersByAdmin: async (page: number = 1): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    const response = await api.get<any>(
      `/api/v1/auth/find_by_admin_all_users?page=${page}&limit=10`,
    );
    return response;
  },
};

export default userApi;
