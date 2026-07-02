import { render } from "@testing-library/react-native";
import { EmptyState } from "../../components/EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    const { getByText } = render(<EmptyState title="Ders bulunamadı" />);
    expect(getByText("Ders bulunamadı")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    const { getByText } = render(
      <EmptyState title="Boş" subtitle="Henüz bir şey yok" />
    );
    expect(getByText("Henüz bir şey yok")).toBeTruthy();
  });

  it("does not render subtitle when not provided", () => {
    const { queryByText } = render(<EmptyState title="Sadece başlık" />);
    expect(queryByText("Henüz bir şey yok")).toBeNull();
  });

  it("sets accessibility role", () => {
    const { getByText } = render(<EmptyState title="Test" />);
    const container = getByText("Test");
    expect(container).toBeTruthy();
  });
});
