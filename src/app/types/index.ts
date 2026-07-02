export interface Review {
  name: string;
  photo: string;
  rating: number;
  date: string;
  text: string;
}

export interface Tutor {
  id: number;
  name: string;
  photo: string;
  title: string;
  subject: string;
  subjects: string[];
  rating: number;
  reviewCount: number;
  price: number;
  experience: number;
  bio: string;
  education: string;
  tags: string[];
  verified: boolean;
  online: boolean;
  reviews: Review[];
}

export interface Category {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface EarningData {
  month: string;
  amount: number;
}

export interface Conversation {
  id: number;
  name: string;
  photo: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface Message {
  id: number;
  from: "tutor" | "student";
  text: string;
  time: string;
}

export interface LessonRequest {
  id: number;
  student: string;
  subject: string;
  date: string;
  duration: string;
  photo: string;
}

export interface UpcomingLesson {
  tutor: string;
  subject: string;
  date: string;
  duration: string;
  photo: string;
}

export interface PastLesson {
  tutor: string;
  subject: string;
  date: string;
  duration: string;
  photo: string;
}
