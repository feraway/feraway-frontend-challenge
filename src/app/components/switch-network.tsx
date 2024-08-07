import { Button } from "@/components/ui";
import { useSwitchChain, useChainId } from "wagmi";
import { Title } from "./title";

export function SwitchNetwork() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-11 mt-12">
      <Title />
      <p className="max-w-96 text-center mb-5">
        You seem to be on the wrong network.
      </p>
      <p className="mb-5">Current supported network: Sepolia</p>
      <Button onClick={() => switchChain({ chainId })}>
        Switch Network to Sepolia
      </Button>
    </main>
  );
}
