import { api } from "./baseApi";

interface ResearchParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

const userResearchApi = {
  getResearcherUsers: async (params?: ResearchParams) => {
    const query = new URLSearchParams();

    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.searchTerm) query.append("searchTerm", params.searchTerm);

    try {
      const response = await api.get(
        `/api/v1/game_one/find_by_researcher_user?${query.toString()}`,
      );

      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  deleteResearcherUser: async (sessionId: string) => {
    try {
      const response = await api.delete(
        `/api/v1/game_one/delete_game_one/${sessionId}`,
      );
      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  getResearcherUserByUserId: async (userId: string) => {
    try {
      const response = await api.get(
        `/api/v1/game_one/find_by_researcher_user?userId=${userId}&limit=1000`,
      );
      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  getSpecificResearcherUserById: async (
    userId: string,
    page?: number,
    limit?: number,
  ) => {
    try {
      const query = new URLSearchParams();
      if (page) query.append("page", page.toString());
      if (limit) query.append("limit", limit.toString());

      const queryString = query.toString();
      const url = `/api/v1/game_one/find_by_specific_researcherUser/${userId}${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  getAllResearcherUsers: async () => {
    try {
      const response = await api.get(
        `/api/v1/game_one/find_by_researcher_user?limit=1000`,
      );
      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};

export default userResearchApi;
