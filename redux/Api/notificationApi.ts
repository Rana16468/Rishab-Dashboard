import { api } from "./baseApi";

export interface NotificationData {
  _id: string;
  title: string;
  message: string;
  userId: {
    _id: string;
    nickname: string;
    photo: string | null;
    id: string;
  };
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  all_notification: NotificationData[];
}

export const notificationApi = {
  getAllNotifications: async (
    page: number = 1,
    limit: number = 10,
  ): Promise<NotificationResponse> => {
    const response = await api.get<NotificationResponse>(
      `/api/v1/notification/find_by_all_notification?page=${page}&limit=${limit}`,
    );
    if (!response.data) {
      throw new Error("No data received from API");
    }
    // FIX: response.data is already NotificationResponse — return it directly
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<any> => {
    const response = await api.patch(
      `/api/v1/notification/${notificationId}/read`,
      {},
    );
    return response;
  },

  markAllAsRead: async (): Promise<any> => {
    const response = await api.patch("/api/v1/notification/mark-all-read", {});
    return response;
  },

  deleteNotification: async (notificationId: string): Promise<any> => {
    const response = await api.delete(`/api/v1/notification/${notificationId}`);
    return response;
  },
};

export default notificationApi;
