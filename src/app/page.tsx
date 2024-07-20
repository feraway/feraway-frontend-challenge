"use client";
import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { SUPPORTED_CONTRACTS_SEPOLIA } from "@/lib/consts";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";

export default function Home() {
  const account = useAccount();
  const [contract, setContract] = useState<string>();

  const selectedContract = contract
    ? SUPPORTED_CONTRACTS_SEPOLIA[
        contract as keyof typeof SUPPORTED_CONTRACTS_SEPOLIA
      ]
    : undefined;

  const {
    data: balance,
    error,
    failureReason,
    fetchStatus,
    isLoading,
    status,
  } = useReadContract({
    address: selectedContract?.address,
    abi: selectedContract?.abi,
    functionName: "balanceOf",
    args: [account.address],
    enabled: !!contract,
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
        <h2 className="text-2xl font-semibold mb-5">Operating With</h2>
        <Combobox
          options={comboboxOptions}
          itemName="token"
          value={contract}
          setValue={setContract}
        />
        <h2 className="text-2xl font-semibold mb-5">
          Balance:{" "}
          {balance ? formatUnits(balance, selectedContract?.decimals) : "---"}
        </h2>
      </main>
    </>
  );
}
