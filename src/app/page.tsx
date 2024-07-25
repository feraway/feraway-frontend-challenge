"use client";
import { useState, useEffect } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SUPPORTED_CONTRACTS_SEPOLIA } from "@/lib/consts";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, parseUnits, type Address } from "viem";
import { isValidEvmAddress } from "@/lib/utils/isValidEvmAddress";
import { useStore } from "@/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { ErrorDialog } from "@/components/error-dialog";
import { maxUint256, numberToHex } from "viem";
import { CheckboxWithText } from "@/components/checkbox-with-text";

enum OPERATIONS {
  MINT = "MINT",
  ALLOWANCE = "ALLOWANCE",
  TRANSFER = "TRANSFER",
}

const comboboxOptions = Object.keys(SUPPORTED_CONTRACTS_SEPOLIA).map(
  (contract) => ({
    value: contract,
    label:
      SUPPORTED_CONTRACTS_SEPOLIA[
        contract as keyof typeof SUPPORTED_CONTRACTS_SEPOLIA
      ].name,
  })
);

export default function Home() {
  const account = useAccount();
  const { targetAddress, setTargetAddress, contract, setContract } = useStore();
  const {
    writeContract,
    status: writeContractStatus,
    data: writeContractTxHash,
    error: writeContractError,
  } = useWriteContract();
  const [amount, setAmount] = useState("");
  const [operationType, setOperationType] = useState<OPERATIONS>();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [maxAllowanceChecked, setMaxAllowanceChecked] = useState(false);

  const { data: { blockHash } = {} } = useWaitForTransactionReceipt({
    hash: writeContractTxHash,
  });

  const selectedContract = contract
    ? SUPPORTED_CONTRACTS_SEPOLIA[
        contract as keyof typeof SUPPORTED_CONTRACTS_SEPOLIA
      ]
    : undefined;

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: selectedContract?.address,
    abi: selectedContract?.abi,
    functionName: "balanceOf",
    args: [account.address],
    enabled: !!contract,
    refetchInterval: 1000,
    cacheTime: 0,
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: selectedContract?.address,
    abi: selectedContract?.abi,
    functionName: "allowance",
    args: [account.address, targetAddress],
    enabled:
      !!contract && !!targetAddress && operationType === OPERATIONS.ALLOWANCE,
  });

  useEffect(() => {
    if (writeContractStatus === "error") {
      setErrorMessage(
        (writeContractError as { shortMessage?: string })?.shortMessage ||
          "An error ocurred"
      );
    }
  }, [writeContractStatus]);

  useEffect(() => {
    setMaxAllowanceChecked(false);
  }, [operationType]);

  useEffect(() => {
    if (blockHash) {
      if (
        operationType === OPERATIONS.TRANSFER ||
        operationType === OPERATIONS.MINT
      ) {
        refetchBalance();
      }
      if (operationType === OPERATIONS.ALLOWANCE) {
        refetchAllowance();
      }
    }
  }, [blockHash]);

  const confirmTransaction = (): void => {
    if (operationType === OPERATIONS.TRANSFER) {
      writeContract({
        address: selectedContract?.address,
        abi: selectedContract?.abi,
        functionName: "transfer",
        args: [targetAddress, parseUnits(amount, selectedContract?.decimals)],
      });
    } else if (operationType === OPERATIONS.MINT) {
      writeContract({
        address: selectedContract?.address,
        abi: selectedContract?.abi,
        functionName: "mint",
        args: [account.address, parseUnits(amount, selectedContract?.decimals)],
      });
    } else if (operationType === OPERATIONS.ALLOWANCE) {
      writeContract({
        address: selectedContract?.address,
        abi: selectedContract?.abi,
        functionName: "approve",
        args: [
          targetAddress as Address,
          maxAllowanceChecked
            ? maxUint256
            : parseUnits(amount, selectedContract?.decimals),
        ],
      });
    }
  };

  const getConfirmationDialogDescription = (): string => {
    if (operationType === OPERATIONS.TRANSFER) {
      return `You are about to transfer ${amount} ${selectedContract?.name} to the address ${targetAddress}. Do you wish to proceed?`;
    } else if (operationType === OPERATIONS.MINT) {
      return `You are about to mint ${amount} ${selectedContract?.name} for the address ${targetAddress}. Do you wish to proceed?`;
    } else if (operationType === OPERATIONS.ALLOWANCE) {
      return `You are about to approve an allowance of ${
        maxAllowanceChecked ? "MAX" : amount
      } ${
        selectedContract?.name
      } for the address ${targetAddress}. Do you wish to proceed?`;
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

  // Input validations
  const isTargetAddressValid =
    !!targetAddress && isValidEvmAddress(targetAddress);
  const isTransferAmountValid =
    !!balance &&
    !!amount &&
    balance >= parseUnits(amount, selectedContract?.decimals || 0);

  // Buttons validations
  const isMintDisabled = !contract || !isTargetAddressValid;
  const isTransferDisabled =
    !contract || !isTargetAddressValid || !isTransferAmountValid;
  const isAllowanceDisabled =
    !contract || !isTargetAddressValid || (!amount && !maxAllowanceChecked);

  return (
    <>
      <header className="flex justify-end p-1">
        <ConnectButton />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-start p-11">
        <h1 className="text-3xl font-semibold mb-5">
          Wonderland Frontend Challenge
        </h1>
        <p className="max-w-96 text-center mb-5">
          This WebApp allows you to transfer tokens, set allowances and mint
          tokens. To begin, please select a token from the list to operate with
        </p>
        <Combobox
          options={comboboxOptions}
          itemName="token"
          value={contract}
          setValue={(x) => setContract(x as Address)}
        />
        <h2 className="text-2xl font-semibold my-5">
          Balance:{" "}
          {balance
            ? formatUnits(balance, selectedContract?.decimals ?? 0)
            : "---"}{" "}
          {selectedContract?.name}
        </h2>
        <p className="mb-5">What would you like to do?</p>
        <Select
          value={operationType}
          onValueChange={(o: OPERATIONS) => setOperationType(o)}
          disabled={!contract}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select an Operation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={OPERATIONS.TRANSFER}>Transfer Tokens</SelectItem>
            <SelectItem value={OPERATIONS.ALLOWANCE}>Set Allowance</SelectItem>
            <SelectItem value={OPERATIONS.MINT}>Mint Tokens</SelectItem>
          </SelectContent>
        </Select>
        <h2 className="text-2xl font-semibold my-5">Target Address:</h2>
        <Input
          value={targetAddress}
          disabled={!contract || !operationType}
          onChange={(e) => setTargetAddress(e.target.value as Address)}
          className="max-w-96"
        />
        {!!contract && !!targetAddress && !isTargetAddressValid && (
          <p className="text-red-700 my-3">Please enter a valid EVM address</p>
        )}
        {operationType === OPERATIONS.ALLOWANCE && !!targetAddress && (
          <>
            <p className="mt-5">
              Current allowance for this address:{" "}
              {!!allowance || allowance === BigInt(0)
                ? formatUnits(allowance, selectedContract?.decimals ?? 0)
                : "---"}{" "}
              {selectedContract?.name}
            </p>
          </>
        )}
        <h2 className="text-2xl font-semibold my-5">Amount:</h2>
        <Input
          type="number"
          className="max-w-96"
          disabled={!contract || !operationType || maxAllowanceChecked}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {operationType === OPERATIONS.ALLOWANCE && (
          <div className="max-w-72 my-3">
            <CheckboxWithText
              labelText="Use max allowance?"
              secondaryText="By giving an address max allowance they have control over all your funds for the desired token"
              checked={maxAllowanceChecked}
              onCheckedChange={setMaxAllowanceChecked}
            />
          </div>
        )}
        {!!contract &&
          !!balance &&
          !!amount &&
          !isTransferAmountValid &&
          operationType === OPERATIONS.TRANSFER && (
            <p className="text-red-700 my-5">
              Your transfer amount is larger than your balance
            </p>
          )}
        <div className="my-5 w-96 flex justify-center">
          {operationType === OPERATIONS.TRANSFER && (
            <Button
              disabled={isTransferDisabled}
              onClick={() => setConfirmationDialogOpen(true)}
            >
              Transfer Tokens
            </Button>
          )}
          {operationType === OPERATIONS.ALLOWANCE && (
            <Button
              disabled={isAllowanceDisabled}
              onClick={() => setConfirmationDialogOpen(true)}
            >
              Set Allowance
            </Button>
          )}
          {operationType === OPERATIONS.MINT && (
            <Button
              disabled={isMintDisabled}
              onClick={() => setConfirmationDialogOpen(true)}
            >
              Mint Tokens
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
      </main>
      <ConfirmationDialog
        title={getConfirmationDialogTitle()}
        description={getConfirmationDialogDescription()}
        open={confirmationDialogOpen}
        onConfirm={() => {
          confirmTransaction();
          setConfirmationDialogOpen(false);
        }}
        onCancel={() => setConfirmationDialogOpen(false)}
      />
      <ErrorDialog
        open={!!errorMessage}
        description={errorMessage}
        onConfirm={() => {
          setErrorMessage("");
        }}
      />
    </>
  );
}
