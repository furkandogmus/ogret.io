import { render, fireEvent } from "@testing-library/react-native";
import { LessonCard } from "../../components/LessonCard";
import type { Lesson } from "../../types";

const baseLesson: Lesson = {
  id: "lesson-1",
  status: "PENDING",
  lessonDate: "2026-07-10",
  startTime: "14:00",
  endTime: "15:00",
  durationMinutes: 60,
  price: 350,
  meetingLink: undefined,
  notes: undefined,
  studentCancelled: false,
  cancellationReason: undefined,
  student: {
    id: "student-1",
    fullName: "Ahmet Öğrenci",
    email: "ahmet@ogret.io",
    phone: "+905551234567",
    role: "STUDENT",
    online: false,
    verified: true,
    profileComplete: true,
    identityVerified: false,
  },
  tutor: {
    id: "tutor-1",
    fullName: "Rabia Çetingül",
    email: "rabia@ogret.io",
    phone: "+905551234567",
    role: "TUTOR",
    online: true,
    verified: true,
    profileComplete: true,
    identityVerified: true,
    hourlyRate: 350,
  },
  subject: { id: "subj-1", name: "Matematik" },
  createdAt: "2026-07-02T12:00:00",
};

describe("LessonCard", () => {
  it("renders other user name based on role", () => {
    const { getByText } = render(
      <LessonCard lesson={baseLesson} userRole="STUDENT" />
    );
    expect(getByText("Rabia Çetingül")).toBeTruthy();
  });

  it("renders subject name", () => {
    const { getByText } = render(
      <LessonCard lesson={baseLesson} userRole="STUDENT" />
    );
    expect(getByText("Matematik")).toBeTruthy();
  });

  it("renders price", () => {
    const { getByText } = render(
      <LessonCard lesson={baseLesson} userRole="STUDENT" />
    );
    expect(getByText("₺350")).toBeTruthy();
  });

  it("renders status badge for PENDING", () => {
    const { getByText } = render(
      <LessonCard lesson={baseLesson} userRole="STUDENT" />
    );
    expect(getByText("Bekliyor")).toBeTruthy();
  });

  it("renders status badge for CONFIRMED", () => {
    const confirmed: Lesson = { ...baseLesson, status: "CONFIRMED" };
    const { getByText } = render(
      <LessonCard lesson={confirmed} userRole="TUTOR" />
    );
    expect(getByText("Onaylandı")).toBeTruthy();
  });

  it("renders status badge for COMPLETED", () => {
    const completed: Lesson = { ...baseLesson, status: "COMPLETED" };
    const { getByText } = render(
      <LessonCard lesson={completed} userRole="STUDENT" />
    );
    expect(getByText("Tamamlandı")).toBeTruthy();
  });

  it("renders status badge for CANCELLED", () => {
    const cancelled: Lesson = { ...baseLesson, status: "CANCELLED" };
    const { getByText } = render(
      <LessonCard lesson={cancelled} userRole="STUDENT" />
    );
    expect(getByText("İptal Edildi")).toBeTruthy();
  });

  it("shows cancel button for PENDING when onCancel provided", () => {
    const { getByText } = render(
      <LessonCard lesson={baseLesson} userRole="STUDENT" onCancel={() => {}} />
    );
    expect(getByText("İptal Et")).toBeTruthy();
  });

  it("shows complete button for CONFIRMED when onComplete provided", () => {
    const confirmed: Lesson = { ...baseLesson, status: "CONFIRMED" };
    const { getByText } = render(
      <LessonCard lesson={confirmed} userRole="TUTOR" onComplete={() => {}} />
    );
    expect(getByText("Tamamla")).toBeTruthy();
  });

  it("does not show cancel button for CONFIRMED", () => {
    const confirmed: Lesson = { ...baseLesson, status: "CONFIRMED" };
    const { queryByText } = render(
      <LessonCard lesson={confirmed} userRole="STUDENT" onCancel={() => {}} />
    );
    expect(queryByText("İptal Et")).toBeNull();
  });

  it("does not show complete button for PENDING", () => {
    const { queryByText } = render(
      <LessonCard lesson={baseLesson} userRole="TUTOR" onComplete={() => {}} />
    );
    expect(queryByText("Tamamla")).toBeNull();
  });

  it("calls onCancel when cancel pressed", () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <LessonCard lesson={baseLesson} userRole="STUDENT" onCancel={onCancel} />
    );
    fireEvent.press(getByText("İptal Et"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onComplete when complete pressed", () => {
    const onComplete = jest.fn();
    const confirmed: Lesson = { ...baseLesson, status: "CONFIRMED" };
    const { getByText } = render(
      <LessonCard lesson={confirmed} userRole="TUTOR" onComplete={onComplete} />
    );
    fireEvent.press(getByText("Tamamla"));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("shows meeting link section for CONFIRMED with link", () => {
    const withLink: Lesson = { ...baseLesson, status: "CONFIRMED", meetingLink: "https://zoom.us/j/123" };
    const { getByText } = render(
      <LessonCard lesson={withLink} userRole="STUDENT" />
    );
    expect(getByText("https://zoom.us/j/123")).toBeTruthy();
  });

  it("renders tutor name when userRole is TUTOR", () => {
    const { getByText } = render(
      <LessonCard lesson={baseLesson} userRole="TUTOR" />
    );
    expect(getByText("Ahmet Öğrenci")).toBeTruthy();
  });
});
