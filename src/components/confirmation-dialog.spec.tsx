import { render, screen } from "@testing-library/react";
import { ConfirmationDialog } from "./confirmation-dialog";
import userEvent from "@testing-library/user-event";

const description = "Confirmation dialog description";
const title = "Confirmation dialog title";

describe("<ConfirmationDialog />", () => {
  test("It shouldn't render if open === false", () => {
    render(
      <ConfirmationDialog
        description={description}
        title={title}
        open={false}
        onConfirm={() => null}
        onCancel={() => null}
      />
    );
    expect(screen.queryByText(description)).not.toBeInTheDocument();
  });

  test("It should render and display a title and a description if open === true", () => {
    render(
      <ConfirmationDialog
        description={description}
        title={title}
        open={true}
        onConfirm={() => null}
        onCancel={() => null}
      />
    );

    expect(screen.queryByText(title)).toBeInTheDocument();
    expect(screen.queryByText(description)).toBeInTheDocument();
  });

  test("It should render a button with text 'Confirm' that calls onConfirm and a button with text 'Cancel' that calls onCancel", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmationDialog
        description={description}
        title={title}
        open={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const ConfirmButton = screen.getByText("Confirm");
    const CancelButton = screen.getByText("Cancel");

    await userEvent.click(ConfirmButton);
    await userEvent.click(CancelButton);

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  test("It should render a button with confirmButtonText that calls onConfirm and a button with cancelButtonText that calls onCancel", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const confirmButtonText = "Custom Confirm Text";
    const cancelButtonText = "Custom Cancel Text";

    render(
      <ConfirmationDialog
        description={description}
        title={title}
        open={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmButtonText={confirmButtonText}
        cancelButtonText={cancelButtonText}
      />
    );

    const ConfirmButton = screen.getByText(confirmButtonText);
    const CancelButton = screen.getByText(cancelButtonText);

    await userEvent.click(ConfirmButton);
    await userEvent.click(CancelButton);

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
