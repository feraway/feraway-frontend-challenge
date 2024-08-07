import { useCallback } from "react";
import { useWriteContract, useAccount } from "wagmi";
import { OPERATIONS } from "@/lib/consts";
import { maxUint256, parseUnits, type Address } from "viem";
import { SupportedContractType, CheckedStateType } from "@/types";

type ConfirmTransactionParametersType = {
  operationType?: OPERATIONS;
  selectedContract: SupportedContractType;
  targetAddress: Address | null;
  amount: string;
  maxAllowanceChecked: CheckedStateType;
};

export function useConfirmTransaction(
  parameters: ConfirmTransactionParametersType
) {
  const {
    operationType,
    selectedContract,
    targetAddress,
    amount,
    maxAllowanceChecked,
  } = parameters;

  const account = useAccount();

  const {
    writeContract,
    status: writeContractStatus,
    data: writeContractTxHash,
    error: writeContractError,
  } = useWriteContract();

  const confirmTransaction = useCallback(() => {
    if (!account.address) return;

    if (operationType === OPERATIONS.TRANSFER) {
      writeContract({
        address: selectedContract.address,
        abi: selectedContract.abi,
        functionName: "transfer",
        args: [targetAddress, parseUnits(amount, selectedContract.decimals)],
      });
    } else if (operationType === OPERATIONS.MINT) {
      writeContract({
        address: selectedContract.address,
        abi: selectedContract.abi,
        functionName: "mint",
        args: [targetAddress, parseUnits(amount, selectedContract.decimals)],
      });
    } else if (operationType === OPERATIONS.ALLOWANCE) {
      writeContract({
        address: selectedContract.address,
        abi: selectedContract.abi,
        functionName: "approve",
        args: [
          targetAddress,
          maxAllowanceChecked
            ? maxUint256
            : parseUnits(amount, selectedContract.decimals),
        ],
      });
    }
  }, [
    account.address,
    amount,
    maxAllowanceChecked,
    operationType,
    selectedContract.abi,
    selectedContract.address,
    selectedContract.decimals,
    targetAddress,
    writeContract,
  ]);

  const getConfirmationDialogDescription = (): string => {
    if (operationType === OPERATIONS.TRANSFER) {
      return `You are about to transfer ${amount} ${selectedContract.name} to the address ${targetAddress}.`;
    } else if (operationType === OPERATIONS.MINT) {
      return `You are about to mint ${amount} ${selectedContract.name} for the address ${targetAddress}.`;
    } else if (operationType === OPERATIONS.ALLOWANCE) {
      return `You are about to approve an allowance of ${
        maxAllowanceChecked ? "MAX" : amount
      } ${selectedContract.name} for the address ${targetAddress}.`;
    }
    return "";
  };

  const getConfirmationDialogTitle = (): string =>
    `Please confirm ${
      operationType === OPERATIONS.TRANSFER
        ? "transfer"
        : operationType === OPERATIONS.MINT
        ? "mint"
        : operationType === OPERATIONS.ALLOWANCE
        ? "allowance approve"
        : ""
    }`;

  return {
    getConfirmationDialogDescription,
    getConfirmationDialogTitle,
    confirmTransaction,
    writeContractStatus,
    writeContractTxHash,
    writeContractError,
  };
}
