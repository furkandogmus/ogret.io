import { Page } from '@playwright/test';

// ─── Mock Data ───

export const mockSubjects = [
  { id: 'sub-math', name: 'Matematik', slug: 'matematik', category: 'YKS', icon: 'Calculator' },
  { id: 'sub-eng', name: 'İngilizce', slug: 'ingilizce', category: 'DIL', icon: 'Globe' },
  { id: 'sub-code', name: 'Yazılım', slug: 'yazilim', category: 'YAZILIM', icon: 'Code2' },
  { id: 'sub-phys', name: 'Fizik', slug: 'fizik', category: 'YKS', icon: 'Zap' },
];

export const mockStudent = {
  id: 'user-student-1',
  email: 'ogrenci@test.com',
  fullName: 'Ahmet Öğrenci',
  role: 'STUDENT' as const,
  phone: '5551234567',
  verified: true,
  profileComplete: true,
  identityVerified: false,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  profileCompletionScore: 100,
  profileCompletion: {
    score: 100,
    complete: true,
    completedItems: 3,
    totalItems: 3,
    items: [
      { key: 'fullName', label: 'Ad soyad', completed: true },
      { key: 'phone', label: 'Telefon', completed: true },
      { key: 'avatarUrl', label: 'Profil fotoğrafı', completed: true },
    ],
  },
};

export const mockTutor = {
  id: 'user-tutor-1',
  email: 'ogretmen@test.com',
  fullName: 'Selim Hoca',
  role: 'TUTOR' as const,
  phone: '5559876543',
  verified: true,
  profileComplete: true,
  identityVerified: true,
  bio: 'Boğaziçi Üniversitesi Matematik Öğretmenliği mezunuyum. 10 yıllık LGS/YKS özel ders tecrübem var.',
  education: JSON.stringify([{ school: 'Boğaziçi Üniversitesi', degree: 'Lisans', field: 'Matematik Öğretmenliği', year: '2016' }]),
  experienceYears: 10,
  hourlyRate: 500,
  ratingAvg: 4.9,
  ratingCount: 15,
  online: true,
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  profileCompletionScore: 100,
  profileCompletion: {
    score: 100,
    complete: true,
    completedItems: 10,
    totalItems: 10,
    items: [
      { key: 'fullName', label: 'Ad soyad', completed: true },
      { key: 'phone', label: 'Telefon', completed: true },
      { key: 'avatarUrl', label: 'Profil fotoğrafı', completed: true },
      { key: 'bio', label: 'Kısa tanıtım', completed: true },
      { key: 'education', label: 'Eğitim bilgisi', completed: true },
      { key: 'experienceYears', label: 'Deneyim yılı', completed: true },
      { key: 'hourlyRate', label: 'Ders ücreti', completed: true },
      { key: 'subjects', label: 'Ders konuları', completed: true },
      { key: 'activeListing', label: 'Aktif ders ilanı', completed: true },
      { key: 'availability', label: 'Haftalık müsaitlik', completed: true },
    ],
  },
};

export const mockAdmin = {
  id: 'user-admin-1',
  email: 'admin@test.com',
  fullName: 'Cem Admin',
  role: 'ADMIN' as const,
  phone: '5550000000',
  verified: true,
  profileComplete: true,
  identityVerified: false,
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
};

export const mockTutorsList = [
  {
    id: 'user-tutor-1',
    fullName: 'Selim Hoca',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    title: 'Boğaziçi Mezunu Matematik Öğretmeni',
    bio: 'Boğaziçi Matematik mezunuyum. LGS/YKS tecrübem var.',
    ratingAvg: 4.9,
    ratingCount: 15,
    hourlyRate: 500,
    experienceYears: 10,
    online: true,
    identityVerified: true,
    subjects: ['Matematik', 'Fizik'],
    tags: ['LGS', 'YKS', 'Matematik'],
  },
  {
    id: 'user-tutor-2',
    fullName: 'Elif İngilizce',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    title: 'Native-Like English Tutor',
    bio: 'İngiliz Dili ve Edebiyatı mezunu. Speaking odaklı dersler veriyorum.',
    ratingAvg: 4.7,
    ratingCount: 8,
    hourlyRate: 400,
    experienceYears: 5,
    online: false,
    identityVerified: false,
    subjects: ['İngilizce'],
    tags: ['Konuşma', 'IELTS', 'Genel İngilizce'],
  },
];

export const mockListings = [
  {
    id: 'list-1',
    tutorId: 'user-tutor-1',
    tutorName: 'Selim Hoca',
    tutorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    subjectId: 'sub-math',
    subjectName: 'Matematik',
    title: 'Boğaziçi Mezunu Matematik Öğretmeni',
    lessonDescription: 'Boğaziçi Matematik mezunuyum. LGS/YKS tecrübem var.',
    aboutTutor: '10 yıllık deneyimli öğretmen.',
    hourlyRate: 500,
    allowsTutorHome: true,
    allowsStudentHome: false,
    allowsOnline: true,
    languages: ['Türkçe'],
    status: 'ACTIVE',
  },
  {
    id: 'list-2',
    tutorId: 'user-tutor-2',
    tutorName: 'Elif İngilizce',
    tutorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    subjectId: 'sub-eng',
    subjectName: 'İngilizce',
    title: 'Native-Like English Tutor',
    lessonDescription: 'İngiliz Dili ve Edebiyatı mezunu. Speaking odaklı dersler veriyorum.',
    aboutTutor: '5 yıllık deneyimli öğretmen.',
    hourlyRate: 400,
    allowsTutorHome: false,
    allowsStudentHome: true,
    allowsOnline: false,
    languages: ['Türkçe', 'İngilizce'],
    status: 'ACTIVE',
  }
];

export const mockReviews = [
  {
    id: 'rev-1',
    rating: 5,
    comment: 'Selim Hoca sayesinde netlerim çok arttı, harika bir anlatımı var.',
    anonymous: false,
    studentName: 'Ahmet Y.',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    createdAt: '2026-06-15T12:00:00Z',
  },
  {
    id: 'rev-2',
    rating: 4,
    comment: 'Çok güler yüzlü ve sabırlı bir öğretmen.',
    anonymous: true,
    studentName: 'Gizli Öğrenci',
    createdAt: '2026-06-10T14:30:00Z',
  },
];

export const mockLessons = [
  {
    id: 'les-1',
    status: 'PENDING' as const,
    lessonDate: '2026-07-10',
    startTime: '14:00',
    endTime: '15:00',
    durationMinutes: 60,
    price: 500,
    notes: 'LGS Matematik deneme soru çözümü yapmak istiyoruz.',
    studentCancelled: false,
    student: mockStudent,
    tutor: mockTutor,
    subject: { id: 'sub-math', name: 'Matematik' },
    createdAt: '2026-07-01T10:00:00Z',
  },
  {
    id: 'les-2',
    status: 'CONFIRMED' as const,
    lessonDate: '2026-07-08',
    startTime: '17:00',
    endTime: '18:00',
    durationMinutes: 60,
    price: 500,
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    studentCancelled: false,
    student: mockStudent,
    tutor: mockTutor,
    subject: { id: 'sub-math', name: 'Matematik' },
    createdAt: '2026-06-30T15:00:00Z',
  },
  {
    id: 'les-3',
    status: 'COMPLETED' as const,
    lessonDate: '2026-06-25',
    startTime: '10:00',
    endTime: '11:00',
    durationMinutes: 60,
    price: 400,
    meetingLink: 'https://meet.google.com/xyz-qprs-tuv',
    studentCancelled: false,
    student: mockStudent,
    tutor: mockTutor,
    subject: { id: 'sub-math', name: 'Matematik' },
    createdAt: '2026-06-24T09:00:00Z',
  },
];

export const mockMessages = [
  {
    id: 'msg-1',
    senderId: 'user-student-1',
    senderName: 'Ahmet Öğrenci',
    receiverId: 'user-tutor-1',
    receiverName: 'Selim Hoca',
    content: 'Merhaba hocam, Matematik dersi almak istiyorum.',
    messageType: 'TEXT' as const,
    read: true,
    createdAt: '2026-07-01T09:30:00Z',
  },
  {
    id: 'msg-2',
    senderId: 'user-tutor-1',
    senderName: 'Selim Hoca',
    receiverId: 'user-student-1',
    receiverName: 'Ahmet Öğrenci',
    content: 'Merhaba Ahmet, tabii ki yardımcı olabilirim. Rezervasyon talebi gönderebilirsin.',
    messageType: 'TEXT' as const,
    read: true,
    createdAt: '2026-07-01T09:35:00Z',
  },
];

export const mockAdminDashboard = {
  totalUsers: 154,
  totalTutors: 45,
  totalStudents: 109,
  totalLessons: 342,
  activeLessons: 24,
  platformEarnings: 3450.00,
  monthlyRegistrations: [
    { month: 'Ocak', users: 12 },
    { month: 'Şubat', users: 24 },
    { month: 'Mart', users: 35 },
    { month: 'Nisan', users: 48 },
    { month: 'Mayıs', users: 70 },
    { month: 'Haziran', users: 154 },
  ],
};

export const mockVerifications = [
  {
    id: 'ver-1',
    tutorId: 'user-tutor-2',
    tutorName: 'Elif İngilizce',
    documentType: 'DIPLOMA',
    documentUrl: 'https://dummyimage.com/600x400/000/fff&text=Elif-Diploma.pdf',
    status: 'PENDING',
    createdAt: '2026-07-01T15:00:00Z',
  },
];

// ─── Routing Mock Setup Helper ───

export async function setupDefaultMocks(page: Page, user?: any) {
  if (user) {
    (page as any)._mockUser = user;
  }
  await page.addInitScript(() => {
    if (!localStorage.getItem('cookie-consent-v2')) {
      localStorage.setItem('cookie-consent-v2', JSON.stringify({
        version: 2,
        necessary: true,
        analytics: false,
        marketing: false,
        updatedAt: new Date().toISOString(),
      }));
    }
  });

  // Mock list of subjects
  await page.route(/\/api\/v1\/subjects/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSubjects),
    });
  });

  // Mock list of tutors (matches /tutors or /tutors?...)
  await page.route(/\/api\/v1\/tutors(\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: mockTutorsList }),
    });
  });

  // Mock tutor profile details
  await page.route(/\/api\/v1\/tutors\/user-tutor-1(\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockTutor),
    });
  });

  // Mock tutor reviews
  await page.route(/\/api\/v1\/tutors\/user-tutor-1\/reviews/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockReviews),
    });
  });

  // Mock tutor availability
  await page.route(/\/api\/v1\/tutors\/user-tutor-1\/availability/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { dayOfWeek: 0, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 2, startTime: '10:00', endTime: '20:00' },
      ]),
    });
  });

  // Mock get user by ID endpoint (used by MessagesPage to get tutor profile details)
  await page.route(/\/api\/v1\/users\/([\w-]+)/, async (route) => {
    const url = route.request().url();
    const userId = url.split('/').pop()?.split('?')[0];
    
    let userDetails = mockTutor;
    if (userId === mockStudent.id || userId?.includes('student') || userId === 'user-student-student') {
      userDetails = mockStudent;
    } else if (userId === 'user-tutor-2' || userId === 'user-tutor-tutor') {
      userDetails = { ...mockTutor, id: 'user-tutor-2', fullName: 'Elif Hoca', email: 'elif@test.com', role: 'TUTOR' };
    }
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(userDetails),
    });
  });

  // Mock conversation details default (empty history)
  await page.route(/\/api\/v1\/messages\?with=([\w-]+)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Mock references fallback
  await page.route(/\/api\/v1\/tutors\/me\/references/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route(/\/api\/v1\/admin\/references/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route(/\/api\/v1\/tutors\/([\w-]+)\/references/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Mock list listings endpoint for search
  await page.route(/\/api\/v1\/tutors\/listings(\?|$)/, async (route) => {
    const url = route.request().url();
    let listings = [...mockListings];
    if (url.includes('online=true')) {
      listings = listings.filter(l => l.allowsOnline);
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: listings, page: 0, totalPages: 1, totalElements: listings.length }),
    });
  });

  // Mock my listings endpoint for tutor dashboard
  await page.route(/\/api\/v1\/tutors\/me\/listings(\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Mock file upload endpoint
  await page.route(/\/api\/v1\/files\/upload(\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: '/storage/dersplatform-public/avatars/11111111-1111-1111-1111-111111111111.png' }),
    });
  });

  // The application no longer reads auth state from localStorage. Legacy E2E
  // fixtures still use it only as input for these mocked cookie-session endpoints.
  const readFixtureUser = async () => {
    if ((page as any)._mockUser) {
      return (page as any)._mockUser;
    }
    return page.evaluate(() => {
      const value = localStorage.getItem('user');
      return value ? JSON.parse(value) : null;
    }).catch(() => null);
  };

  await page.route(/\/api\/v1\/auth\/refresh(\?|$)/, async (route) => {
    const user = await readFixtureUser();
    await route.fulfill({
      status: user ? 200 : 401,
      contentType: 'application/json',
      body: JSON.stringify(user ? { user } : { message: 'Kimlik doğrulama gerekli' }),
    });
  });

  await page.route(/\/api\/v1\/auth\/logout(\?|$)/, async (route) => {
    await page.evaluate(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });
    await route.fulfill({ status: 204, body: '' });
  });

  await page.route(/\/api\/v1\/users\/me(\?|$)/, async (route) => {
    const user = await readFixtureUser();
    await route.fulfill({
      status: user ? 200 : 401,
      contentType: 'application/json',
      body: JSON.stringify(user || { message: 'Kimlik doğrulama gerekli' }),
    });
  });

  await page.route(/\/api\/v1\/notifications(\?|$)/, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
}
