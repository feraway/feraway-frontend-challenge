import { render, screen } from "@testing-library/react";
import { CheckboxWithText } from "./checkbox-with-text";
import userEvent from "@testing-library/user-event";

describe("<CheckboxWithText />", () => {
  test("It should render label text and no secondary text", () => {
    const labelText = "Checkbox label";
    render(
      <CheckboxWithText
        labelText={labelText}
        checked={true}
        onCheckedChange={() => null}
      />
    );
    expect(screen.getByLabelText(labelText)).toBeInTheDocument();
    expect(
      screen.queryByTestId("checkbox-secondary-text")
    ).not.toBeInTheDocument();
  });
  test("It should render label text and no secondary text", () => {
    const labelText = "Checkbox label";
    const secondaryText = "Checkbox secondary text";
    render(
      <CheckboxWithText
        labelText={labelText}
        checked={true}
        onCheckedChange={() => null}
        secondaryText={secondaryText}
      />
    );
    expect(screen.getByLabelText(labelText)).toBeInTheDocument();
    expect(screen.getByText(secondaryText)).toBeInTheDocument();
  });
  test("It should call the onCheckedChange fn when clicked", async () => {
    const onCheckedChange = vi.fn();
    render(
      <CheckboxWithText
        labelText={"Checkbox label"}
        checked={true}
        onCheckedChange={onCheckedChange}
      />
    );
    const Checkbox = screen.getByRole("checkbox");
    await userEvent.click(Checkbox);
    expect(onCheckedChange).toHaveBeenCalledOnce();
  });
  test("It should have a checked state when checked === true", async () => {
    const onCheckedChange = vi.fn();
    const CheckboxWithTextRendered = render(
      <CheckboxWithText
        labelText={"Checkbox label"}
        checked={true}
        onCheckedChange={onCheckedChange}
      />
    );
    const CheckedState = CheckboxWithTextRendered.container.querySelector(
      "button[data-state='checked']"
    );
    expect(CheckedState).toBeInTheDocument();
  });
  test("It should have a unchecked state when checked === false", async () => {
    const onCheckedChange = vi.fn();
    const CheckboxWithTextRendered = render(
      <CheckboxWithText
        labelText={"Checkbox label"}
        checked={false}
        onCheckedChange={onCheckedChange}
      />
    );
    const CheckedState = CheckboxWithTextRendered.container.querySelector(
      "button[data-state='unchecked']"
    );
    expect(CheckedState).toBeInTheDocument();
  });
  test("It should have a indeterminate state when checked === 'indeterminate", async () => {
    const onCheckedChange = vi.fn();
    const CheckboxWithTextRendered = render(
      <CheckboxWithText
        labelText={"Checkbox label"}
        checked="indeterminate"
        onCheckedChange={onCheckedChange}
      />
    );
    const CheckedState = CheckboxWithTextRendered.container.querySelector(
      "button[data-state='indeterminate']"
    );
    expect(CheckedState).toBeInTheDocument();
  });
});
