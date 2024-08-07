"use client";

import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { StoreProvider } from "@/store";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallback } from "@/components/error-boundary-fallback";

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

export const config = getDefaultConfig({
  appName: "Wonderland Frontend Challenge",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
  chains: [sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary fallbackRender={ErrorBoundaryFallback}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <StoreProvider>{children}</StoreProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}
