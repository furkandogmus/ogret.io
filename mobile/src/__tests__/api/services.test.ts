import { authApi, userApi, tutorApi, lessonApi, reviewApi, favoriteApi, subscriptionApi, verificationApi } from "../../api/services";

jest.mock("axios");

const mockAxios = require("axios");

const mockTokens = {
  data: { accessToken: "access-123", refreshToken: "refresh-123" },
};

const mockUser = {
  data: {
    id: "user-1",
    email: "test@ogret.io",
    fullName: "Test User",
    role: "STUDENT",
    phone: "+905551234567",
    online: false,
    verified: true,
    profileComplete: true,
    identityVerified: false,
  },
};

const mockTutors = {
  data: {
    content: [
      {
        id: "tutor-1",
        fullName: "Zeynep Kaya",
        ratingAvg: 4.5,
        ratingCount: 12,
        hourlyRate: 350,
        experienceYears: 5,
        online: true,
        identityVerified: true,
        subjects: ["Matematik", "Fizik"],
        tags: ["LGS", "YKS"],
      },
    ],
  },
};

const mockLesson = {
  data: {
    id: "lesson-1",
    status: "PENDING",
    lessonDate: "2026-07-10",
    startTime: "14:00",
    endTime: "15:00",
    durationMinutes: 60,
    price: 350,
    studentCancelled: false,
    student: { id: "student-1", fullName: "Test Student" },
    tutor: { id: "tutor-1", fullName: "Test Tutor" },
    subject: { id: "subj-1", name: "Matematik" },
    createdAt: "2026-07-02T12:00:00",
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("authApi", () => {
  it("login calls POST /auth/login with credentials", async () => {
    mockAxios.post.mockResolvedValue(mockTokens);
    const { data } = await authApi.login("test@ogret.io", "123456");
    expect(mockAxios.post).toHaveBeenCalledWith("/auth/login", {
      email: "test@ogret.io",
      password: "123456",
    });
    expect(data.accessToken).toBe("access-123");
    expect(data.refreshToken).toBe("refresh-123");
  });

  it("register calls POST /auth/register with user data", async () => {
    mockAxios.post.mockResolvedValue(mockTokens);
    const payload = {
      email: "new@ogret.io",
      phone: "+905551234567",
      password: "123456",
      fullName: "New User",
      role: "STUDENT" as const,
    };
    const { data } = await authApi.register(payload);
    expect(mockAxios.post).toHaveBeenCalledWith("/auth/register", payload);
    expect(data.accessToken).toBe("access-123");
  });
});

describe("userApi", () => {
  it("getMe calls GET /users/me", async () => {
    mockAxios.get.mockResolvedValue(mockUser);
    const { data } = await userApi.getMe();
    expect(mockAxios.get).toHaveBeenCalledWith("/users/me");
    expect(data.id).toBe("user-1");
    expect(data.role).toBe("STUDENT");
  });

  it("updateProfile calls PUT /users/me with partial data", async () => {
    const updated = { data: { fullName: "Updated Name", bio: "New bio" } };
    mockAxios.put.mockResolvedValue(updated);
    const { data } = await userApi.updateProfile({ fullName: "Updated Name", bio: "New bio" });
    expect(mockAxios.put).toHaveBeenCalledWith("/users/me", {
      fullName: "Updated Name",
      bio: "New bio",
    });
    expect(data.fullName).toBe("Updated Name");
  });
});

describe("tutorApi", () => {
  it("list calls GET /tutors with query params", async () => {
    mockAxios.get.mockResolvedValue(mockTutors);
    const { data } = await tutorApi.list({ minRating: 4, subjectId: "subj-1" });
    expect(mockAxios.get).toHaveBeenCalledWith("/tutors", {
      params: { minRating: 4, subjectId: "subj-1" },
    });
    expect(data.content).toHaveLength(1);
    expect(data.content[0].fullName).toBe("Zeynep Kaya");
  });

  it("list with all filter params", async () => {
    mockAxios.get.mockResolvedValue({ data: { content: [] } });
    await tutorApi.list({
      subjectId: "subj-1",
      minPrice: 100,
      maxPrice: 500,
      minRating: 4,
      sort: "rating",
      page: 1,
      size: 20,
    });
    expect(mockAxios.get).toHaveBeenCalledWith("/tutors", {
      params: { subjectId: "subj-1", minPrice: 100, maxPrice: 500, minRating: 4, sort: "rating", page: 1, size: 20 },
    });
  });
});

describe("lessonApi", () => {
  it("create calls POST /lessons with lesson data", async () => {
    mockAxios.post.mockResolvedValue(mockLesson);
    const payload = {
      tutorId: "tutor-1",
      subjectId: "subj-1",
      lessonDate: "2026-07-10",
      startTime: "14:00",
      endTime: "15:00",
      notes: "Test dersi",
    };
    const { data } = await lessonApi.create(payload);
    expect(mockAxios.post).toHaveBeenCalledWith("/lessons", payload);
    expect(data.status).toBe("PENDING");
  });

  it("confirm calls PUT /lessons/:id/confirm", async () => {
    mockAxios.put.mockResolvedValue({
      data: { ...mockLesson.data, status: "CONFIRMED" },
    });
    const { data } = await lessonApi.confirm("lesson-1");
    expect(mockAxios.put).toHaveBeenCalledWith("/lessons/lesson-1/confirm");
    expect(data.status).toBe("CONFIRMED");
  });

  it("cancel calls PUT /lessons/:id/cancel with reason param", async () => {
    mockAxios.put.mockResolvedValue({
      data: { ...mockLesson.data, status: "CANCELLED" },
    });
    const { data } = await lessonApi.cancel("lesson-1", "Müsait değil");
    expect(mockAxios.put).toHaveBeenCalledWith("/lessons/lesson-1/cancel", null, {
      params: { reason: "Müsait değil" },
    });
    expect(data.status).toBe("CANCELLED");
  });
});

describe("reviewApi", () => {
  it("create calls POST /lessons/:id/review", async () => {
    mockAxios.post.mockResolvedValue({
      data: { id: "review-1", rating: 5, comment: "Harika!", anonymous: false },
    });
    const { data } = await reviewApi.create("lesson-1", {
      rating: 5,
      comment: "Harika!",
      anonymous: false,
    });
    expect(mockAxios.post).toHaveBeenCalledWith("/lessons/lesson-1/review", {
      rating: 5,
      comment: "Harika!",
      anonymous: false,
    });
    expect(data.rating).toBe(5);
  });
});

describe("favoriteApi", () => {
  it("list calls GET /favorites", async () => {
    mockAxios.get.mockResolvedValue({
      data: [{ id: "tutor-1", fullName: "Zeynep Kaya" }],
    });
    const { data } = await favoriteApi.list();
    expect(mockAxios.get).toHaveBeenCalledWith("/favorites");
    expect(data).toHaveLength(1);
  });

  it("add calls POST /favorites/:tutorId", async () => {
    mockAxios.post.mockResolvedValue({ status: 200 });
    await favoriteApi.add("tutor-2");
    expect(mockAxios.post).toHaveBeenCalledWith("/favorites/tutor-2");
  });

  it("remove calls DELETE /favorites/:tutorId", async () => {
    mockAxios.delete.mockResolvedValue({ status: 200 });
    await favoriteApi.remove("tutor-1");
    expect(mockAxios.delete).toHaveBeenCalledWith("/favorites/tutor-1");
  });
});

describe("subscriptionApi", () => {
  it("getPlans returns plan list", async () => {
    const plans = {
      data: [
        { type: "BASIC", name: "Basic", price: 49, features: ["f1"] },
        { type: "PREMIUM", name: "Premium", price: 99, features: ["f1", "f2"] },
        { type: "VIP", name: "VIP", price: 199, features: ["f1", "f2", "f3"] },
      ],
    };
    mockAxios.get.mockResolvedValue(plans);
    const { data } = await subscriptionApi.getPlans();
    expect(mockAxios.get).toHaveBeenCalledWith("/subscriptions/plans");
    expect(data).toHaveLength(3);
    expect(data[1].type).toBe("PREMIUM");
  });
});

describe("verificationApi", () => {
  it("submit sends document", async () => {
    mockAxios.post.mockResolvedValue({
      data: { id: "verif-1", status: "PENDING" },
    });
    const { data } = await verificationApi.submit({
      documentType: "IDENTITY",
      documentUrl: "data:image/jpeg;base64,...",
    });
    expect(mockAxios.post).toHaveBeenCalledWith("/verifications", {
      documentType: "IDENTITY",
      documentUrl: "data:image/jpeg;base64,...",
    });
    expect(data.status).toBe("PENDING");
  });
});

describe("messageApi", () => {
  it("getConversation calls with userId", async () => {
    mockAxios.get.mockResolvedValue({ data: [] });
    const { default: msgApi } = await import("../../api/services");
    await msgApi.messageApi.getConversation("user-2");
    expect(mockAxios.get).toHaveBeenCalledWith("/messages", {
      params: { with: "user-2" },
    });
  });
});

describe("adminApi", () => {
  it("getDashboard calls GET /admin/dashboard", async () => {
    mockAxios.get.mockResolvedValue({
      data: { totalUsers: 100, totalTutors: 20, totalLessons: 150 },
    });
    const { default: svc } = await import("../../api/services");
    const { data } = await svc.adminApi.getDashboard();
    expect(mockAxios.get).toHaveBeenCalledWith("/admin/dashboard");
    expect(data.totalUsers).toBe(100);
  });
});
