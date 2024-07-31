import { render, screen } from "@testing-library/react";
import { ErrorDialog } from "./error-dialog";
import userEvent from "@testing-library/user-event";

describe("<ErrorDialog />", () => {
  test("It shouldn't render if open === false", () => {
    const description = "Error dialog test";
    render(
      <ErrorDialog
        open={false}
        onConfirm={() => null}
        description={description}
      />
    );
    expect(screen.queryByText(description)).not.toBeInTheDocument();
  });
  test("It should render and display an error message if open === true", () => {
    const description = "Error dialog test";
    render(
      <ErrorDialog open onConfirm={() => null} description={description} />
    );
    expect(screen.getByText(description)).toBeInTheDocument();
  });
  test("It should have an h2 spelling 'Error'", () => {
    const description = "Error dialog test";
    render(
      <ErrorDialog open onConfirm={() => null} description={description} />
    );
    expect(screen.getByRole("heading")).toHaveTextContent("Error");
  });
  test("It should trigger the onConfirm fn after clicking the close button", async () => {
    const description = "Error dialog test";
    const onConfirmFn = vi.fn();
    render(
      <ErrorDialog open onConfirm={onConfirmFn} description={description} />
    );
    expect(screen.getByText(description)).toBeInTheDocument();
    await userEvent.click(screen.getByText("Close"));
    expect(onConfirmFn).toHaveBeenCalledOnce();
  });
});
