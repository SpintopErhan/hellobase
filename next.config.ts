// next.config.ts
    import type { NextConfig } from 'next';

    const nextConfig: NextConfig = {
      reactStrictMode: true,
      transpilePackages: [
        'wagmi',
        'viem',
        '@wagmi/connectors',
        '@tanstack/react-query',
        '@wagmi/core',
        '@walletconnect/modal-html',       // Bu paketler Wagmi'nin iç bağımlılığıdır
        '@walletconnect/ethereum-provider', // Transpile etmek sorunu çözebilir
        '@walletconnect/utils',
        '@walletconnect/jsonrpc-utils',
        'multiformats',
        'lru-cache',
        'p-retry',
        'eventemitter3',
        'p-jvi',
        'porto',                          // En inatçı sorunlar için buraya eklemiştik
      ],
    };

    export default nextConfig;