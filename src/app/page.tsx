import { Combobox } from "@/components/ui/combobox";
import { SUPPORTED_CONTRACTS_SEPOLIA } from "@/lib/consts";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <>
      <header className="flex justify-end p-1">
        <ConnectButton />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-start p-24">
        <h2 className="text-2xl font-semibold mb-5">Operating With</h2>
        <Combobox options={SUPPORTED_CONTRACTS_SEPOLIA} itemName="token" />
      </main>
    </>
  );
}
