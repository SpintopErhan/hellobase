"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, WagmiProvider, http, createStorage, noopStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors'; 
import { ReactNode, useState, useMemo } from 'react';

const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'YOUR_PROJECT_ID';

export function Providers({ children }: { children: ReactNode }) {
  // QueryClient'ı sadece bir kez oluşturmak için useState kullanıyoruz
  const [queryClient] = useState(() => new QueryClient());

  // Config'i build hatalarını önleyecek şekilde optimize ediyoruz
  const config = useMemo(() => 
    createConfig({
      chains: [base, baseSepolia],
      // Build sırasında tarayıcı API'lerine (indexedDB vb.) erişimi engeller:
      storage: createStorage({
        storage: typeof window !== 'undefined' ? window.localStorage : noopStorage,
      }),
      transports: {
        [base.id]: http(),
        [baseSepolia.id]: http(),
      },
      connectors: [
        injected(),
        walletConnect({ 
          projectId: WALLETCONNECT_PROJECT_ID, 
          showQrModal: true 
        }),
      ],
      ssr: true, 
    }), []
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}