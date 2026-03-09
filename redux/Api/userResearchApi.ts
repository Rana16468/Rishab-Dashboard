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
};

export default userResearchApi;
