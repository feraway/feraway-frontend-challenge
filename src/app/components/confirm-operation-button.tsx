import { Button } from "@/components/ui";
import { type Address } from "viem";
import { OPERATIONS } from "@/lib/consts";

type ConfirmOperationButtonProps = {
  operationType?: OPERATIONS;
  contract?: Address;
  disabled: boolean;
  onClick: () => void;
};
export function ConfirmOperationButton(props: ConfirmOperationButtonProps) {
  const { operationType, contract, disabled, onClick } = props;
  return (
    <div className="my-7 w-96 flex justify-center">
      {operationType && (
        <Button disabled={disabled} onClick={onClick} role="confirm-button">
          {operationType === OPERATIONS.ALLOWANCE
            ? "Set Allowance"
            : operationType === OPERATIONS.TRANSFER
            ? "Send Tokens"
            : operationType === OPERATIONS.MINT
            ? "Confirm Mint"
            : null}
        </Button>
      )}
      {(!operationType || !contract) && (
        <Button disabled>
          {!contract
            ? "Please select a token"
            : !operationType
            ? "Please select an operation to perform"
            : ""}
        </Button>
      )}
    </div>
  );
}
