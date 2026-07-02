export interface User {
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

export interface TutorSummary {
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

export interface Lesson {
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
  student: User;
  tutor: User;
  subject: { id: string; name: string };
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  anonymous: boolean;
  studentName?: string;
  studentAvatar?: string;
  createdAt: string;
}

export interface Message {
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

export interface Subscription {
  id: string;
  planType: "BASIC" | "PREMIUM" | "VIP";
  price: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  paymentMethod?: string;
}

export interface Reference {
  id: string;
  tutorId: string;
  tutorName: string;
  recommenderName: string;
  recommenderEmail: string;
  recommenderTitle: string;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface TutorListing {
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
}

export interface WsNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  senderName?: string;
  senderAvatar?: string;
  read: boolean;
  createdAt: string;
}

export interface WsMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalTutors: number;
  totalLessons: number;
  totalRevenue?: number;
}

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
