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
