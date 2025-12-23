// app/providers.tsx
"use client"; // Bu dosyanın bir Client Component olduğundan emin olmalıyız

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { injected } from '@wagmi/connectors';
import { createPublicClient, http } from 'viem';
import { ReactNode } from 'react';

// Wagmi Config oluştur
const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    // WalletConnect'i önceki sorunlar nedeniyle devre dışı bırakıyoruz
  ],
  client: ({ chain }) => createPublicClient({
    chain,
    transport: http(),
  }),
  ssr: true, // SSR için bu ayar önemli
});

// React Query istemcisi oluştur
const queryClient = new QueryClient();

// !!! ÖNEMLİ: Providers bir named export olmalı
export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}