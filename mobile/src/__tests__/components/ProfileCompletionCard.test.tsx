import { render } from "@testing-library/react-native";
import { ProfileCompletionCard } from "../../components/ProfileCompletionCard";

describe("ProfileCompletionCard", () => {
  it("shows the server score and its missing checklist items", () => {
    const { getByTestId, getByText, getByLabelText } = render(
      <ProfileCompletionCard
        complete={false}
        score={100}
        completion={{
          score: 70,
          complete: false,
          completedItems: 7,
          totalItems: 10,
          items: [
            { key: "avatarUrl", label: "Profil fotoğrafı", completed: false },
            { key: "availability", label: "Haftalık müsaitlik", completed: false },
          ],
        }}
      />,
    );

    expect(getByTestId("profile-completion-score").props.children).toEqual(["%", 70]);
    expect(getByText("Eksikler: Profil fotoğrafı, Haftalık müsaitlik")).toBeTruthy();
    expect(getByLabelText("Profil tamamlanma yüzdesi").props.accessibilityValue.now).toBe(70);
  });

  it("falls back to the compatibility completion flag", () => {
    const { getByText } = render(<ProfileCompletionCard complete />);
    expect(getByText("%100")).toBeTruthy();
    expect(getByText("Profiliniz kullanıma hazır.")).toBeTruthy();
  });
});
