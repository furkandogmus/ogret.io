import { api } from "./client";
import type { User, TutorSummary, Lesson, Subject, Review, Message, Subscription } from "../types";

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: { email: string; phone: string; password: string; fullName: string; role: "STUDENT" | "TUTOR" }) =>
    api.post("/auth/register", data),
};

export const userApi = {
  getMe: () => api.get<User>("/users/me"),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  updateProfile: (data: Partial<User>) => api.put<User>("/users/me", data),
  updateAvatar: (avatarUrl: string) => api.put<User>("/users/me/avatar", { avatarUrl }),
  search: (q: string) => api.get<User[]>("/users", { params: { q } }),
};

export const tutorApi = {
  list: (params?: { subjectId?: string; minPrice?: number; maxPrice?: number; minRating?: number; sort?: string; page?: number; size?: number }) =>
    api.get<{ content: TutorSummary[] }>("/tutors", { params }),
  getById: (id: string) => api.get<User>(`/tutors/${id}`),
  getAvailability: (id: string) => api.get(`/tutors/${id}/availability`),
  updateSubjects: (subjectIds: string[]) => api.put("/tutors/me/subjects", subjectIds),
  updateAvailability: (slots: { dayOfWeek: number; startTime: string; endTime: string }[]) =>
    api.put("/tutors/me/availability", slots),
};

export const subjectApi = {
  list: () => api.get<Subject[]>("/subjects"),
};

export const lessonApi = {
  list: (as?: "student" | "tutor") => api.get<Lesson[]>("/lessons", { params: { as } }),
  create: (data: { tutorId: string; subjectId: string; lessonDate: string; startTime: string; endTime: string; notes?: string }) =>
    api.post<Lesson>("/lessons", data),
  confirm: (id: string) => api.put<Lesson>(`/lessons/${id}/confirm`),
  cancel: (id: string, reason?: string) => api.put<Lesson>(`/lessons/${id}/cancel`, null, { params: { reason } }),
  complete: (id: string) => api.put<Lesson>(`/lessons/${id}/complete`),
  updateMeetingLink: (id: string, link: string) => api.put<Lesson>(`/lessons/${id}/meeting-link`, { meetingLink: link }),
};

export const reviewApi = {
  getTutorReviews: (tutorId: string) => api.get<Review[]>(`/tutors/${tutorId}/reviews`),
  create: (lessonId: string, data: { rating: number; comment?: string }) =>
    api.post<Review>(`/lessons/${lessonId}/review`, data),
};

export const messageApi = {
  getConversation: (withUserId: string) => api.get<Message[]>("/messages", { params: { with: withUserId } }),
  send: (data: { receiverId: string; content: string }) => api.post<Message>("/messages", data),
  getUnread: () => api.get<Message[]>("/messages/unread"),
  markAsRead: (id: string) => api.put(`/messages/${id}/read`),
};

export const favoriteApi = {
  list: () => api.get<User[]>("/favorites"),
  add: (tutorId: string) => api.post(`/favorites/${tutorId}`),
  remove: (tutorId: string) => api.delete(`/favorites/${tutorId}`),
};

export const subscriptionApi = {
  getPlans: () => api.get("/subscriptions/plans"),
  subscribe: (planType: string) => api.post<Subscription>("/subscriptions", { planType }),
  getMy: () => api.get<Subscription>("/subscriptions/me"),
  cancel: () => api.post("/subscriptions/cancel"),
};

export const verificationApi = {
  submit: (data: { documentType: string; documentUrl: string }) => api.post("/verifications", data),
};

export const fileApi = {
  upload: async (uri: string, isPublic: boolean = true) => {
    const formData = new FormData();
    const filename = uri.split("/").pop() || "photo.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    formData.append("file", { uri, name: filename, type: mimeType } as any);
    formData.append("isPublic", String(isPublic));
    return api.post<{ url: string }>("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const adminApi = {
  getUsers: () => api.get<User[]>("/admin/users"),
  getDashboard: () => api.get<{ totalUsers: number; totalTutors: number; totalLessons: number }>("/admin/dashboard"),
  verifyUser: (userId: string) => api.put(`/admin/users/${userId}/verify`),
};
