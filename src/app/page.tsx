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
  } = useWriteContract();
  const [amount, setAmount] = useState();
  const [operationType, setOperationType] = useState<OPERATIONS>();

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
    !contract || !isTargetAddressValid || (!amount && amount !== 0);

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
          <p className="mt-5">
            Current allowance for this address:{" "}
            {!!allowance || allowance === BigInt(0)
              ? formatUnits(allowance, selectedContract?.decimals ?? 0)
              : "---"}{" "}
            {selectedContract?.name}
          </p>
        )}
        <h2 className="text-2xl font-semibold my-5">Amount:</h2>
        <Input
          type="number"
          className="max-w-96"
          disabled={!contract || !operationType}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
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
              onClick={() => {
                writeContract({
                  address: selectedContract?.address,
                  abi: selectedContract?.abi,
                  functionName: "transfer",
                  args: [
                    targetAddress,
                    parseUnits(amount, selectedContract?.decimals),
                  ],
                });
              }}
            >
              Transfer Tokens
            </Button>
          )}
          {operationType === OPERATIONS.ALLOWANCE && (
            <Button
              disabled={isAllowanceDisabled}
              onClick={() => {
                writeContract({
                  address: selectedContract?.address,
                  abi: selectedContract?.abi,
                  functionName: "approve",
                  args: [
                    targetAddress as Address,
                    parseUnits(amount, selectedContract?.decimals),
                  ],
                });
              }}
            >
              Set Allowance
            </Button>
          )}
          {operationType === OPERATIONS.MINT && (
            <Button
              disabled={isMintDisabled}
              onClick={() => {
                writeContract({
                  address: selectedContract?.address,
                  abi: selectedContract?.abi,
                  functionName: "mint",
                  args: [
                    account.address,
                    parseUnits(amount, selectedContract?.decimals),
                  ],
                  enabled: !!contract,
                });
              }}
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
    </>
  );
}
