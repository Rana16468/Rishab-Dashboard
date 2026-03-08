import { api } from "./baseApi";

export const userApi = {
  findAllUsersByAdmin: async (
    page: number = 1,
    searchTerm: string = "",
  ): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    let url = `/api/v1/auth/find_by_admin_all_users?page=${page}&limit=10`;
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }

    const response = await api.get<any>(url);
    return response;
  },

  verifyUser: async (userId: string): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    const response = await api.patch<any>(
      `/api/v1/auth/user_verification/${userId}`,
      {
        isVerify: true,
      },
    );
    return response;
  },
};

export default userApi;
