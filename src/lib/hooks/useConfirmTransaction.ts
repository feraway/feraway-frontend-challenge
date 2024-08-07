import { useCallback } from "react";
import { useWriteContract, useAccount } from "wagmi";
import { OPERATIONS } from "@/lib/consts";
import { maxUint256, parseUnits, type Address } from "viem";
import { SupportedContractType, CheckedStateType } from "@/types";
import { WT18_DAI_ABI, WT6_USDC_ABI } from "@/lib/abis";

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
    if (!account.address || !targetAddress || !operationType) return;

    /**
     * I'm making distinct writeContract() calls per contract so I can directly set the contracts ABI, const asserted,
     * and get type safety on the contract call. Doing something like { abi: selectedContract.abi } doesn't
     * give you type safety (you can't dynamically set the abi or args AND get type safety, it has to be a const asserted
     * abi or written inline).
     * https://wagmi.sh/core/typescript#const-assert-abis-typed-data
     */
    const contractCalls = {
      [OPERATIONS.TRANSFER]: () => {
        const transferContractArgs: {
          address: Address;
          functionName: "transfer";
          args: [Address, bigint];
        } = {
          address: selectedContract.address,
          functionName: "transfer",
          args: [targetAddress, parseUnits(amount, selectedContract.decimals)],
        };

        if (selectedContract.name === "WT18_DAI") {
          writeContract({
            abi: WT18_DAI_ABI,
            ...transferContractArgs,
          });
        } else if (selectedContract.name === "WT6_USDC") {
          writeContract({
            abi: WT6_USDC_ABI,
            ...transferContractArgs,
          });
        }
      },
      [OPERATIONS.MINT]: () => {
        const mintContractArgs: {
          address: Address;
          functionName: "mint";
          args: [Address, bigint];
        } = {
          address: selectedContract.address,
          functionName: "mint",
          args: [targetAddress, parseUnits(amount, selectedContract.decimals)],
        };

        if (selectedContract.name === "WT18_DAI") {
          writeContract({
            abi: WT18_DAI_ABI,
            ...mintContractArgs,
          });
        } else if (selectedContract.name === "WT6_USDC") {
          writeContract({
            abi: WT6_USDC_ABI,
            ...mintContractArgs,
          });
        }
      },
      [OPERATIONS.ALLOWANCE]: () => {
        const allowanceContractArgs: {
          address: Address;
          functionName: "approve";
          args: [Address, bigint];
        } = {
          address: selectedContract.address,
          functionName: "approve",
          args: [
            targetAddress,
            maxAllowanceChecked
              ? maxUint256
              : parseUnits(amount, selectedContract.decimals),
          ],
        };
        if (selectedContract.name === "WT18_DAI") {
          writeContract({
            abi: WT18_DAI_ABI,
            ...allowanceContractArgs,
          });
        } else if (selectedContract.name === "WT6_USDC") {
          writeContract({
            abi: WT6_USDC_ABI,
            ...allowanceContractArgs,
          });
        }
      },
    };

    contractCalls[operationType]();
  }, [
    account.address,
    amount,
    maxAllowanceChecked,
    operationType,
    selectedContract.address,
    selectedContract.decimals,
    selectedContract.name,
    targetAddress,
    writeContract,
  ]);

  const confirmationDialogTextOptions = {
    [OPERATIONS.TRANSFER]: {
      title: "Please confirm transfer",
      description: `You are about to transfer ${amount} ${selectedContract.name} to the address ${targetAddress}.`,
    },
    [OPERATIONS.MINT]: {
      title: "Please confirm mint",
      description: `You are about to mint ${amount} ${selectedContract.name} for the address ${targetAddress}.`,
    },
    [OPERATIONS.ALLOWANCE]: {
      title: "Please confirm allowance approve",
      description: `You are about to approve an allowance of ${
        maxAllowanceChecked ? "MAX" : amount
      } ${selectedContract.name} for the address ${targetAddress}.`,
    },
    fallback: { title: "", description: "" },
  };

  return {
    confirmationDialogText:
      confirmationDialogTextOptions[operationType || "fallback"],
    confirmTransaction,
    writeContractStatus,
    writeContractTxHash,
    writeContractError,
  };
}
