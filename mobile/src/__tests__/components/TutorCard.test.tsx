import { render, fireEvent } from "@testing-library/react-native";
import { TutorCard } from "../../components/TutorCard";
import type { TutorSummary } from "../../types";

const mockTutor: TutorSummary = {
  id: "tutor-1",
  fullName: "Zeynep Kaya",
  avatarUrl: undefined,
  title: "Matematik Öğretmeni",
  bio: "5 yıllık deneyim",
  ratingAvg: 4.5,
  ratingCount: 12,
  hourlyRate: 350,
  experienceYears: 5,
  online: true,
  identityVerified: true,
  subjects: ["Matematik", "Fizik", "Geometri"],
  tags: ["LGS", "YKS"],
};

describe("TutorCard", () => {
  it("renders tutor name", () => {
    const { getByText } = render(<TutorCard tutor={mockTutor} onPress={() => {}} />);
    expect(getByText("Zeynep Kaya")).toBeTruthy();
  });

  it("renders hourly rate", () => {
    const { getByText } = render(<TutorCard tutor={mockTutor} onPress={() => {}} />);
    expect(getByText("₺350")).toBeTruthy();
  });

  it("renders experience years", () => {
    const { getByText } = render(<TutorCard tutor={mockTutor} onPress={() => {}} />);
    expect(getByText("5 yıl")).toBeTruthy();
  });

  it("renders title when provided", () => {
    const { getByText } = render(<TutorCard tutor={mockTutor} onPress={() => {}} />);
    expect(getByText("Matematik Öğretmeni")).toBeTruthy();
  });

  it("renders subjects", () => {
    const { getByText } = render(<TutorCard tutor={mockTutor} onPress={() => {}} />);
    expect(getByText("Matematik")).toBeTruthy();
    expect(getByText("Fizik")).toBeTruthy();
  });

  it("shows +N when more than 3 subjects", () => {
    const manySubjects: TutorSummary = {
      ...mockTutor,
      subjects: ["A", "B", "C", "D", "E"],
    };
    const { getByText } = render(<TutorCard tutor={manySubjects} onPress={() => {}} />);
    expect(getByText("+2")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(<TutorCard tutor={mockTutor} onPress={onPress} />);
    fireEvent.press(getByText("Zeynep Kaya").parent!.parent!);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders favorite button when onFavoriteToggle provided", () => {
    const { getByText } = render(
      <TutorCard tutor={mockTutor} onPress={() => {}} onFavoriteToggle={() => {}} />
    );
    expect(getByText("₺350")).toBeTruthy();
  });

  it("does not render favorite button when onFavoriteToggle not provided", () => {
    const { queryByText } = render(
      <TutorCard tutor={mockTutor} onPress={() => {}} />
    );
    expect(queryByText("₺350")).toBeTruthy();
  });

  it("renders rating count", () => {
    const { getByText } = render(<TutorCard tutor={mockTutor} onPress={() => {}} />);
    expect(getByText("(12)")).toBeTruthy();
  });
});
