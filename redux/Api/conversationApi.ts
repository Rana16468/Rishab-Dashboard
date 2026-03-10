import { api } from "./baseApi";

interface ConversationParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

interface Conversation {
  _id: string;
  userText: string;
  reply: string;
  userId: {
    _id: string;
    nickname: string;
    photo: string;
    name: string;
    id: string;
  };
  question_category: string;
  conversation_topic: string;
  icope_health_trigger: boolean;
  mental_distress: boolean;
  summary: string;
  audio_file: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ConversationsResponse {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  all_conversation_memories: Conversation[];
}

const conversationApi = {
  findAllConversationsByUser: async (
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ConversationsResponse> => {
    const url = `/api/v1/chatbot/find_all_conversation/${userId}?page=${page}&limit=${limit}`;
    const response = await api.get<ConversationsResponse>(url);
    return response.data as ConversationsResponse;
  },

  deleteConversationByConversetionId: async (
    conversationId: string,
  ): Promise<void> => {
    const url = `/api/v1/chatbot/delete_conversation_memory/${conversationId}`;
    const response = await api.delete<void>(url);
    return response.data;
  },
};

export default conversationApi;
