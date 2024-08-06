import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Title } from "./title";

export function ConnectWallet() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-11 mt-12">
      <Title />
      <p className="max-w-96 text-center mb-5">
        This WebApp allows you to transfer tokens, set allowances and mint
        tokens.
      </p>
      <p className="mb-5">Please connect your wallet to start</p>
      <ConnectButton />
    </main>
  );
}
