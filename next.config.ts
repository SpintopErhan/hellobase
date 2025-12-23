// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'wagmi',
    'viem',
    '@wagmi/connectors', // injected konnektörü için gerekli
    '@tanstack/react-query',
    '@wagmi/core',
    // WalletConnect paketlerini buraya eklemiyoruz, çünkü kurmadık
  ],
};

export default nextConfig;