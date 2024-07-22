"use client";
import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SUPPORTED_CONTRACTS_SEPOLIA } from "@/lib/consts";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { useStore } from "@/store";

export default function Home() {
  const account = useAccount();
  const { targetAddress, setTargetAddress, contract, setContract } = useStore();
  const { writeContract, status: writeContractStatus } = useWriteContract();
  const [amount, setAmount] = useState();

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

  console.log("logger", {
    allowance,
    error,
    failureReason,
    fetchStatus,
    isLoading,
    status,
  });

  console.log("logger allowance", allowance);

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
        <h2 className="text-2xl font-semibold mb-5">Operating With</h2>
        <Combobox
          options={comboboxOptions}
          itemName="token"
          value={contract}
          setValue={setContract}
        />
        <h2 className="text-2xl font-semibold mb-5">
          Balance:{" "}
          {balance
            ? formatUnits(balance, selectedContract?.decimals ?? 0)
            : "---"}
        </h2>
        <h2 className="text-2xl font-semibold mb-5">Target Address:</h2>
        <Input
          value={targetAddress}
          onChange={(e) => setTargetAddress(e.target.value)}
        />
        <p className="my-5">
          Allowance:{" "}
          {allowance
            ? formatUnits(allowance, selectedContract?.decimals ?? 0)
            : "---"}
        </p>
        <h2 className="text-2xl font-semibold mb-5">Amount:</h2>
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
        <div className="my-5 w-96 flex justify-between">
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
        </div>
      </main>
    </>
  );
}
