import { render, screen } from "@testing-library/react";
import { LastTransactionStatus } from "./last-transaction-status";
import userEvent from "@testing-library/user-event";

const txHash = "0x0000000000000000000000000000000000000000";
const error = "There was an error in your transaction";
const titlePartial = "Last transaction";
describe("<LastTransactionStatus />", () => {
  test("It should show fallback text when loading === false", () => {
    render(<LastTransactionStatus isLoading={false} confirmed={false} />);

    expect(screen.queryByText(`${titlePartial} details`)).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Once you make a transaction, details will appear here"
      )
    ).toBeInTheDocument();
  });

  test("It should show pending title and description and txHash linking to sepolia scan when loading", () => {
    render(
      <LastTransactionStatus
        isLoading={true}
        confirmed={false}
        txHash={txHash}
      />
    );

    expect(screen.queryByText(`${titlePartial} pending`)).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Your last transaction is being processed, your balance or allowance will be updated once it finishes."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: txHash })).toHaveAttribute(
      "href",
      `https://sepolia.etherscan.io/tx/${txHash}`
    );
  });

  test("It should show pending title and description and no txHash linking to sepolia scan when loading and there's no txHash", () => {
    render(<LastTransactionStatus isLoading={true} confirmed={false} />);

    expect(screen.queryByText(`${titlePartial} pending`)).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Your last transaction is being processed, your balance or allowance will be updated once it finishes."
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: txHash })
    ).not.toBeInTheDocument();
  });

  test("It should show error title and description and txHash linking to sepolia scan when passed an error string", () => {
    render(
      <LastTransactionStatus
        isLoading={false}
        confirmed={true}
        txHash={txHash}
        error={error}
      />
    );

    expect(screen.queryByText(`${titlePartial} failed`)).toBeInTheDocument();
    expect(
      screen.queryByText(`Your las transaction failed. Error: "${error}"`)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: txHash })).toHaveAttribute(
      "href",
      `https://sepolia.etherscan.io/tx/${txHash}`
    );
  });

  test("It should show a success title and a txHash linking to sepolia scan when confirmed with no error", () => {
    render(
      <LastTransactionStatus
        isLoading={false}
        confirmed={true}
        txHash={txHash}
      />
    );

    expect(screen.queryByText(`${titlePartial} confirmed`)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: txHash })).toHaveAttribute(
      "href",
      `https://sepolia.etherscan.io/tx/${txHash}`
    );
  });
});
