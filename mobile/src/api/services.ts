import { api } from "./client";
import type { User, TutorSummary, Lesson, Subject, Review, Message, Subscription, Reference, DashboardStats, TutorListing, CreateListingRequest } from "../types";

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; refreshToken: string }>("/auth/login", { email, password }),
  register: (data: { email: string; phone: string; password: string; fullName: string; role: "STUDENT" | "TUTOR" }) =>
    api.post<{ accessToken: string; refreshToken: string }>("/auth/register", data),
  verifyEmail: (token: string) => api.post("/auth/verify-email", { token }),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, newPassword: string) => api.post("/auth/reset-password", { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put("/users/me/password", { currentPassword, newPassword }),
};

export const userApi = {
  getMe: () => api.get<User>("/users/me"),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  updateProfile: (data: Partial<{ fullName: string; bio: string; education: string; hourlyRate: number; experienceYears: number; phone: string }>) => api.put<User>("/users/me", data),
  updateAvatar: (avatarUrl: string) => api.put<User>("/users/me/avatar", { avatarUrl }),
  search: (q: string) => api.get<User[]>("/users", { params: { q } }),
};

export const tutorApi = {
  list: (params?: { subjectId?: string; minPrice?: number; maxPrice?: number; minRating?: number; sort?: string; page?: number; size?: number }) =>
    api.get<{ content: TutorSummary[]; totalPages: number; totalElements: number }>("/tutors", { params }),
  getById: (id: string) => api.get<User>(`/tutors/${id}`),
  getMySubjects: () => api.get<{ subjectId: string; subjectName: string; id: string }[]>("/tutors/me/subjects"),
  updateSubjects: (subjectIds: string[]) => api.put("/tutors/me/subjects", subjectIds),
  getAvailability: (id: string) => api.get<{ id: string; dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[]>(`/tutors/${id}/availability`),
  getMyAvailability: () => api.get<{ id: string; dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[]>("/tutors/me/availability"),
  updateAvailability: (slots: { dayOfWeek: number; startTime: string; endTime: string }[]) =>
    api.put("/tutors/me/availability", slots),
};

export const subjectApi = {
  list: () => api.get<Subject[]>("/subjects"),
  getTutors: (id: string) => api.get<TutorSummary[]>(`/subjects/${id}/tutors`),
};

export const lessonApi = {
  list: (as?: "student" | "tutor") => api.get<Lesson[]>("/lessons", { params: { as } }),
  getById: (id: string) => api.get<Lesson>(`/lessons/${id}`),
  create: (data: { tutorId: string; subjectId: string; lessonDate: string; startTime: string; endTime: string; notes?: string }) =>
    api.post<Lesson>("/lessons", data),
  confirm: (id: string) => api.put<Lesson>(`/lessons/${id}/confirm`),
  cancel: (id: string, reason?: string) => api.put<Lesson>(`/lessons/${id}/cancel`, { reason }),
  start: (id: string) => api.put<Lesson>(`/lessons/${id}/start`),
  complete: (id: string) => api.put<Lesson>(`/lessons/${id}/complete`),
  updateMeetingLink: (id: string, link: string) => api.put<Lesson>(`/lessons/${id}/meeting-link`, { meetingLink: link }),
};

export const reviewApi = {
  getTutorReviews: (tutorId: string) => api.get<Review[]>(`/tutors/${tutorId}/reviews`),
  getMyReviews: () => api.get<Review[]>("/reviews"),
  create: (lessonId: string, data: { rating: number; comment?: string; anonymous?: boolean }) =>
    api.post<Review>(`/lessons/${lessonId}/review`, data),
};

export const messageApi = {
  getConversation: (withUserId: string) => api.get<Message[]>("/messages", { params: { with: withUserId } }),
  send: (data: { receiverId: string; content: string; lessonId?: string }) => api.post<Message>("/messages", data),
  getUnread: () => api.get<Message[]>("/messages/unread"),
  markAsRead: (id: string) => api.put(`/messages/${id}/read`),
};

export const favoriteApi = {
  list: () => api.get<User[]>("/favorites"),
  add: (tutorId: string) => api.post(`/favorites/${tutorId}`),
  remove: (tutorId: string) => api.delete(`/favorites/${tutorId}`),
};

export const subscriptionApi = {
  getPlans: () => api.get<{ type: string; name: string; price: number; features: string[] }[]>("/subscriptions/plans"),
  subscribe: (planType: string, paymentMethod?: string) => api.post<Subscription>("/subscriptions", { planType, paymentMethod }),
  getMy: () => api.get<Subscription>("/subscriptions/me"),
  cancel: () => api.post("/subscriptions/cancel"),
};

export const verificationApi = {
  submit: (data: { documentType: string; documentUrl: string }) => api.post<{ id: string; status: string }>("/verifications", data),
};

export const referenceApi = {
  create: (tutorId: string, data: { recommenderName: string; recommenderEmail: string; recommenderTitle: string; comment: string }) =>
    api.post<Reference>(`/tutors/${tutorId}/references`, data),
  getApproved: (tutorId: string) => api.get<Reference[]>(`/tutors/${tutorId}/references`),
  getMyReferences: () => api.get<Reference[]>("/tutors/me/references"),
  getPending: () => api.get<Reference[]>("/admin/references"),
  updateStatus: (id: string, approved: boolean) => api.put(`/admin/references/${id}`, { approved }),
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
  getUsers: (params?: { page?: number; size?: number }) =>
    api.get<{ content: User[]; totalPages: number; totalElements: number }>("/admin/users", { params }),
  getDashboard: () => api.get<DashboardStats>("/admin/dashboard"),
  verifyUser: (userId: string) => api.put(`/admin/users/${userId}/verify`),
  getVerifications: () => api.get<{ id: string; userId: string; documentType: string; status: string }[]>("/admin/verifications"),
  reviewVerification: (id: string, approved: boolean, adminNote?: string) => api.put(`/admin/verifications/${id}`, { approved, adminNote }),
  getLessons: (params?: { page?: number; size?: number }) =>
    api.get<{ content: Lesson[]; totalPages: number; totalElements: number }>("/admin/lessons", { params }),
};

export const blogApi = {
  getPosts: (params?: { categoryId?: string; page?: number; size?: number }) =>
    api.get<{ content: BlogPostResponse[]; totalPages: number; totalElements: number }>("/blog/posts", { params }),
  getPost: (slug: string) => api.get<BlogPostResponse>(`/blog/posts/${slug}`),
  getFeatured: (params?: { page?: number; size?: number }) =>
    api.get<{ content: BlogPostResponse[]; totalPages: number }>("/blog/featured", { params }),
  getCategories: () => api.get<BlogCategoryResponse[]>("/blog/categories"),
  getTags: () => api.get<BlogTagResponse[]>("/blog/tags"),
  recordView: (id: string) => api.post(`/blog/posts/${id}/view`),
};

export interface BlogPostResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author?: { id: string; fullName: string; avatarUrl?: string };
  category?: { id: string; name: string; slug: string };
  tags: { id: string; name: string; slug: string }[];
  status: string;
  publishedAt?: string;
  readingTime?: number;
  isFeatured: boolean;
  viewCount: number;
}

export interface BlogCategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

export interface BlogTagResponse {
  id: string;
  name: string;
  slug: string;
}

export const listingApi = {
  create: (data: CreateListingRequest) => api.post<TutorListing>("/tutors/me/listings", data),
  getMyListings: (status?: string) => api.get<TutorListing[]>("/tutors/me/listings", { params: { status } }),
  update: (id: string, data: CreateListingRequest) => api.put<TutorListing>(`/tutors/me/listings/${id}`, data),
  delete: (id: string) => api.delete(`/tutors/me/listings/${id}`),
  getTutorListings: (tutorId: string) => api.get<TutorListing[]>(`/tutors/${tutorId}/listings`),
  searchListings: (params?: { q?: string; subjectId?: string; minPrice?: number; maxPrice?: number; minRating?: number; online?: boolean; sort?: string; page?: number; size?: number }) =>
    api.get<{ content: TutorListing[]; totalPages: number; totalElements: number }>("/tutors/listings", { params }),
  getListingDetails: (id: string) => api.get<TutorListing>(`/tutors/listings/${id}`),
};
