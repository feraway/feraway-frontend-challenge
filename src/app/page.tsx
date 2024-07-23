"use client";
import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SUPPORTED_CONTRACTS_SEPOLIA } from "@/lib/consts";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits, type Address } from "viem";
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

export default function Home() {
  const account = useAccount();
  const { targetAddress, setTargetAddress, contract, setContract } = useStore();
  const { writeContract, status: writeContractStatus } = useWriteContract();
  const [amount, setAmount] = useState();
  const [operationType, setOperationType] = useState<OPERATIONS>();

  const selectedContract = contract
    ? SUPPORTED_CONTRACTS_SEPOLIA[
        contract as keyof typeof SUPPORTED_CONTRACTS_SEPOLIA
      ]
    : undefined;

  const { data: balance } = useReadContract({
    address: selectedContract?.address,
    abi: selectedContract?.abi,
    functionName: "balanceOf",
    args: [account.address],
    enabled: !!contract,
  });

  const {
    data: allowance,
    error,
    failureReason,
    fetchStatus,
    isLoading,
    status,
  } = useReadContract({
    address: selectedContract?.address,
    abi: selectedContract?.abi,
    functionName: "allowance",
    args: [account.address, targetAddress],
    enabled: !!contract && !!targetAddress,
  });

  const comboboxOptions = Object.keys(SUPPORTED_CONTRACTS_SEPOLIA).map(
    (contract) => ({
      value: contract,
      label:
        SUPPORTED_CONTRACTS_SEPOLIA[
          contract as keyof typeof SUPPORTED_CONTRACTS_SEPOLIA
        ].name,
    })
  );

  return (
    <>
      <header className="flex justify-end p-1">
        <ConnectButton />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-start p-24">
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
          onValueChange={setOperationType}
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
        {operationType === OPERATIONS.ALLOWANCE && !!targetAddress && (
          <p className="my-5">
            Allowance:{" "}
            {allowance
              ? formatUnits(allowance, selectedContract?.decimals ?? 0)
              : "---"}{" "}
            {selectedContract?.name}
          </p>
        )}
        <h2 className="text-2xl font-semibold my-5">Amount:</h2>
        <Input
          className="max-w-96"
          disabled={!contract || !operationType}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="my-5 w-96 flex justify-center">
          {operationType === OPERATIONS.TRANSFER && (
            <Button
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
              Transfer
            </Button>
          )}
          {operationType === OPERATIONS.ALLOWANCE && (
            <Button
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
              Allowance
            </Button>
          )}
          {operationType === OPERATIONS.MINT && (
            <Button
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
              Mint
            </Button>
          )}
          {!operationType && (
            <Button disabled>Please select an operation to perform</Button>
          )}
        </div>
      </main>
    </>
  );
}
