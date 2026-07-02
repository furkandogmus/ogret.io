import { render, fireEvent } from "@testing-library/react-native";
import { StarRating } from "../../components/StarRating";

describe("StarRating", () => {
  it("renders 5 touchable stars", () => {
    const { UNSAFE_getAllByType } = render(<StarRating rating={3} />);
    const TouchableOpacity = require("react-native").TouchableOpacity;
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    expect(touchables.length).toBe(5);
  });

  it("does not call onRate when not interactive", () => {
    const onRate = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <StarRating rating={3} onRate={onRate} />
    );
    const TouchableOpacity = require("react-native").TouchableOpacity;
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    expect(onRate).not.toHaveBeenCalled();
  });

  it("calls onRate when interactive", () => {
    const onRate = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <StarRating rating={3} interactive onRate={onRate} />
    );
    const TouchableOpacity = require("react-native").TouchableOpacity;
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    expect(onRate).toHaveBeenCalledWith(1);
  });

  it("calls onRate with correct star value on third star", () => {
    const onRate = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <StarRating rating={0} interactive onRate={onRate} />
    );
    const TouchableOpacity = require("react-native").TouchableOpacity;
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[2]);
    expect(onRate).toHaveBeenCalledWith(3);
  });

  it("accepts custom size", () => {
    const { UNSAFE_getAllByType } = render(<StarRating rating={3} size={24} />);
    const TouchableOpacity = require("react-native").TouchableOpacity;
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    expect(touchables.length).toBe(5);
  });
});
