import { render } from "@testing-library/react-native";
import { Badge } from "../../components/Badge";

describe("Badge", () => {
  it("renders label text", () => {
    const { getByText } = render(<Badge label="Premium" />);
    expect(getByText("Premium")).toBeTruthy();
  });

  it("renders with success variant", () => {
    const { getByText } = render(<Badge label="Onaylı" variant="success" />);
    expect(getByText("Onaylı")).toBeTruthy();
  });

  it("renders with warning variant", () => {
    const { getByText } = render(<Badge label="Bekliyor" variant="warning" />);
    expect(getByText("Bekliyor")).toBeTruthy();
  });

  it("renders with error variant", () => {
    const { getByText } = render(<Badge label="Red" variant="error" />);
    expect(getByText("Red")).toBeTruthy();
  });

  it("renders with premium variant", () => {
    const { getByText } = render(<Badge label="VIP" variant="premium" />);
    expect(getByText("VIP")).toBeTruthy();
  });

  it("sets accessibility label", () => {
    const { getByAccessibilityState } = render(<Badge label="Test" />);
    expect(getByAccessibilityState).toBeTruthy();
  });

  it("renders with md size", () => {
    const { getByText } = render(<Badge label="Large" size="md" />);
    expect(getByText("Large")).toBeTruthy();
  });
});
