import { type Dispatch, type SetStateAction } from "react";
import { Input } from "@/components/ui";
import { CheckboxWithText } from "@/components";
import { useStore } from "@/store";
import { OPERATIONS } from "@/lib/consts";
import { SupportedContractType, CheckedStateType } from "@/types";

type AmountInputPropsType = {
  amount: string;
  balance?: bigint;
  isTransferAmountValid: boolean;
  operationType?: OPERATIONS;
  maxAllowanceChecked: CheckedStateType;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setMaxAllowanceChecked: Dispatch<SetStateAction<boolean | "indeterminate">>;
  selectedContract: SupportedContractType;
  isDecimalsValid: boolean;
};
export function AmountInput(props: AmountInputPropsType) {
  const {
    amount,
    balance,
    isTransferAmountValid,
    operationType,
    maxAllowanceChecked,
    onChange,
    setMaxAllowanceChecked,
    selectedContract,
    isDecimalsValid,
  } = props;
  const { contract } = useStore();

  const showTransferAmountError =
    !!contract &&
    !!balance &&
    !!amount &&
    !isTransferAmountValid &&
    operationType === OPERATIONS.TRANSFER;

  return (
    <>
      <Input
        type="number"
        className="max-w-96 mb-1"
        disabled={!contract || !operationType || !!maxAllowanceChecked}
        value={amount}
        onChange={onChange}
        placeholder="Please set an amount"
      />
      <div className="w-full flex flex-col items-center min-h-[40px]">
        {operationType === OPERATIONS.ALLOWANCE && (
          <div className="max-w-72 mt-5">
            <CheckboxWithText
              labelText="Use max allowance?"
              secondaryText="By giving an address max allowance they have control over all your funds for the desired token"
              checked={maxAllowanceChecked}
              onCheckedChange={setMaxAllowanceChecked}
            />
          </div>
        )}
        {showTransferAmountError && (
          <p className="text-red-700 mt-3">
            Your transfer amount is larger than your balance
          </p>
        )}
        {!!amount && !isDecimalsValid && (
          <p className="text-red-700 mt-3">
            You are using more decimals than your contract allows. Limit:{" "}
            {selectedContract.decimals}
          </p>
        )}
      </div>
    </>
  );
}
