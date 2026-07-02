import api from "./client";

// ─── Types matching backend DTOs ───

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: "STUDENT" | "TUTOR" | "ADMIN";
  avatarUrl?: string;
  phone: string;
  bio?: string;
  education?: string;
  experienceYears?: number;
  hourlyRate?: number;
  ratingAvg?: number;
  ratingCount?: number;
  online: boolean;
  verified: boolean;
  profileComplete: boolean;
  identityVerified: boolean;
  popularityScore?: number;
  responseTimeHours?: number;
}

export interface TutorSummaryResponse {
  id: string;
  fullName: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  ratingAvg: number;
  ratingCount: number;
  hourlyRate: number;
  experienceYears: number;
  online: boolean;
  identityVerified: boolean;
  popularityScore?: number;
  responseTimeHours?: number;
  premiumPlan?: "BASIC" | "PREMIUM" | "VIP" | null;
  subjects: string[];
  tags: string[];
}

export interface LessonResponse {
  id: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  lessonDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  price: number;
  meetingLink?: string;
  notes?: string;
  studentCancelled: boolean;
  cancellationReason?: string;
  student: UserResponse;
  tutor: UserResponse;
  subject: { id: string; name: string };
  createdAt: string;
}

export interface SubjectResponse {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon?: string;
}

export interface ReviewResponse {
  id: string;
  rating: number;
  comment?: string;
  anonymous: boolean;
  studentName?: string;
  studentAvatar?: string;
  createdAt: string;
}

export interface ReferenceResponse {
  id: string;
  tutorId: string;
  tutorName: string;
  recommenderName: string;
  recommenderEmail: string;
  recommenderTitle: string;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface MessageResponse {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  content: string;
  messageType: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  fileUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface SubscriptionResponse {
  id: string;
  planType: "BASIC" | "PREMIUM" | "VIP";
  price: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  paymentMethod?: string;
}

// ─── Users ───

export const userApi = {
  getById: (id: string) =>
    api.get<UserResponse>(`/users/${id}`),

  search: (q: string) =>
    api.get<UserResponse[]>("/users", { params: { q } }),

  updateProfile: (data: {
    fullName?: string;
    bio?: string;
    education?: string;
    experienceYears?: number;
    hourlyRate?: number;
  }) => api.put<UserResponse>("/users/me", data),

  updateAvatar: (avatarUrl: string) =>
    api.put<UserResponse>("/users/me/avatar", { avatarUrl }),
};

// ─── Auth ───

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  register: (data: { email: string; phone: string; password: string; fullName: string; role: "STUDENT" | "TUTOR" }) =>
    api.post("/auth/register", data),
};

// ─── Tutors ───

export const tutorApi = {
  list: (params?: { subjectId?: string; minPrice?: number; maxPrice?: number; minRating?: number; sort?: string; page?: number; size?: number }) =>
    api.get<{ content: TutorSummaryResponse[] }>("/tutors", { params }),

  getById: (id: string) =>
    api.get<UserResponse>(`/tutors/${id}`),

  getMySubjects: () =>
    api.get<{ subjectId: string; subjectName: string; id: string }[]>("/tutors/me/subjects"),

  updateMySubjects: (subjectIds: string[]) =>
    api.put("/tutors/me/subjects", subjectIds),

  getMyAvailability: () =>
    api.get<{ id: string; dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[]>("/tutors/me/availability"),

  updateMyAvailability: (slots: { dayOfWeek: number; startTime: string; endTime: string }[]) =>
    api.put("/tutors/me/availability", slots),
};

// ─── Lessons ───

export const lessonApi = {
  list: (as?: "student" | "tutor") =>
    api.get<LessonResponse[]>("/lessons", { params: { as } }),

  getById: (id: string) =>
    api.get<LessonResponse>(`/lessons/${id}`),

  create: (data: { tutorId: string; subjectId: string; lessonDate: string; startTime: string; endTime: string; notes?: string }) =>
    api.post<LessonResponse>("/lessons", data),

  confirm: (id: string) =>
    api.put<LessonResponse>(`/lessons/${id}/confirm`),

  cancel: (id: string, reason?: string) =>
    api.put<LessonResponse>(`/lessons/${id}/cancel`, null, { params: { reason } }),

  complete: (id: string) =>
    api.put<LessonResponse>(`/lessons/${id}/complete`),

  updateMeetingLink: (id: string, meetingLink: string) =>
    api.put<LessonResponse>(`/lessons/${id}/meeting-link`, { meetingLink }),
};

// ─── Subjects ───

export const subjectApi = {
  list: () =>
    api.get<SubjectResponse[]>("/subjects"),

  getTutors: (id: string) =>
    api.get<TutorSummaryResponse[]>(`/subjects/${id}/tutors`),
};

// ─── Reviews ───

export const reviewApi = {
  getTutorReviews: (tutorId: string) =>
    api.get<ReviewResponse[]>(`/tutors/${tutorId}/reviews`),

  getMyReviews: () =>
    api.get<ReviewResponse[]>("/reviews"),

  create: (lessonId: string, data: { rating: number; comment?: string; anonymous?: boolean }) =>
    api.post<ReviewResponse>(`/lessons/${lessonId}/review`, data),
};

// ─── References ───

export const referenceApi = {
  create: (tutorId: string, data: { recommenderName: string; recommenderEmail: string; recommenderTitle: string; comment: string }) =>
    api.post<ReferenceResponse>(`/tutors/${tutorId}/references`, data),

  getApproved: (tutorId: string) =>
    api.get<ReferenceResponse[]>(`/tutors/${tutorId}/references`),

  getMyReferences: () =>
    api.get<ReferenceResponse[]>("/tutors/me/references"),

  getPending: () =>
    api.get<ReferenceResponse[]>("/admin/references"),

  updateStatus: (id: string, approved: boolean) =>
    api.put(`/admin/references/${id}`, { approved }),
};

// ─── Messages ───

export const messageApi = {
  getConversation: (withUserId: string) =>
    api.get<MessageResponse[]>("/messages", { params: { with: withUserId } }),

  send: (data: { receiverId: string; content: string; lessonId?: string }) =>
    api.post<MessageResponse>("/messages", data),

  getUnread: () =>
    api.get<MessageResponse[]>("/messages/unread"),

  markAsRead: (id: string) =>
    api.put(`/messages/${id}/read`),
};

// ─── Favorites ───

export const favoriteApi = {
  list: () =>
    api.get<UserResponse[]>("/favorites"),

  add: (tutorId: string) =>
    api.post(`/favorites/${tutorId}`),

  remove: (tutorId: string) =>
    api.delete(`/favorites/${tutorId}`),
};

// ─── Subscriptions ───

export const subscriptionApi = {
  getPlans: () =>
    api.get("/subscriptions/plans"),

  subscribe: (planType: string, paymentMethod?: string) =>
    api.post<SubscriptionResponse>("/subscriptions", { planType, paymentMethod }),

  getMySubscription: () =>
    api.get<SubscriptionResponse>("/subscriptions/me"),

  cancel: () =>
    api.post("/subscriptions/cancel"),
};

// ─── Verifications ───

export const verificationApi = {
  submit: (data: { documentType: string; documentUrl: string }) =>
    api.post<{ id: string; status: string }>("/verifications", data),
};

// ─── Admin ───

export const adminApi = {
  getDashboard: () =>
    api.get("/admin/dashboard"),

  getUsers: () =>
    api.get<UserResponse[]>("/admin/users"),

  verifyUser: (id: string) =>
    api.put<UserResponse>(`/admin/users/${id}/verify`),

  getVerifications: () =>
    api.get("/admin/verifications"),

  reviewVerification: (id: string, approved: boolean, adminNote?: string) =>
    api.put(`/admin/verifications/${id}`, { approved, adminNote }),

  getLessons: () =>
    api.get<LessonResponse[]>("/admin/lessons"),
};

// ─── Tutor Listings ───

export interface CreateListingRequest {
  subjectId: string;
  title: string;
  lessonDescription: string;
  aboutTutor: string;
  hourlyRate: number;
  allowsTutorHome: boolean;
  allowsStudentHome: boolean;
  allowsOnline: boolean;
  maxTravelDistanceKm?: number;
  languages: string[];
}

export interface ListingResponse {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar?: string;
  subjectId: string;
  subjectName: string;
  title: string;
  lessonDescription: string;
  aboutTutor: string;
  hourlyRate: number;
  allowsTutorHome: boolean;
  allowsStudentHome: boolean;
  allowsOnline: boolean;
  maxTravelDistanceKm?: number;
  languages: string[];
  status: string;
  createdAt?: string;
}

export const listingApi = {
  create: (data: CreateListingRequest) =>
    api.post<ListingResponse>("/tutors/me/listings", data),

  getMyListings: (status?: string) =>
    api.get<ListingResponse[]>("/tutors/me/listings", { params: { status } }),

  update: (id: string, data: CreateListingRequest) =>
    api.put<ListingResponse>(`/tutors/me/listings/${id}`, data),

  delete: (id: string) =>
    api.delete(`/tutors/me/listings/${id}`),

  getTutorListings: (tutorId: string) =>
    api.get<ListingResponse[]>(`/tutors/${tutorId}/listings`),

  getListingDetails: (id: string) =>
    api.get<ListingResponse>(`/tutors/listings/${id}`),

  searchListings: (params: {
    subjectId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    online?: boolean;
    sort?: string;
  }) =>
    api.get<ListingResponse[]>("/tutors/listings", { params }),
};

// ─── File Upload ───

export const fileApi = {
  upload: (file: File, isPublic: boolean = true) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<{ url: string }>("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        public: isPublic,
      },
    });
  },
};

