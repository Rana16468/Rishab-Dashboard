import { api } from "./baseApi";

const dashboardApi = {
  findAllUsersByAdminDashboard: async (
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

  userGraph: async (): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    const response = await api.get<any>("/api/v1/user/user_graph");
    return response;
  },

  gameGraph: async (
    year: string = "2026",
    gameMode: string = "UOT",
  ): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    const response = await api.get<any>(
      `/api/v1/speak_game/game_graph?year=${year}&gameMode=${gameMode}`,
    );
    return response;
  },

  conversationGraph: async (year: string = "2026"): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    const response = await api.get<any>(
      `/api/v1/chatbot/conversation_growth?year=${year}`,
    );
    return response;
  },

  graphStars: async (): Promise<any> => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    const response = await api.get<any>(
      "/api/v1/notification/find_by_all_dashboard_list",
    );
    return response;
  },
};

export default dashboardApi;
