import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorDialog } from "./error-dialog";

test("ErrorDialog", () => {
  const description = "Error dialog test";
  render(<ErrorDialog open onConfirm={() => null} description={description} />);
  expect(screen.getByText(description)).toBeInTheDocument();
});
