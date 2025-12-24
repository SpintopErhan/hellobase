"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useFarcasterMiniApp } from "@/hooks/useFarcasterMiniApp";
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useSendTransaction, 
  useWaitForTransactionReceipt,
  useWriteContract,
  useChainId,
  useSwitchChain,
  type Connector // Tip tanımı için eklendi
} from 'wagmi';
import { parseEther } from 'viem';
import { base, baseSepolia } from 'wagmi/chains';

const NFT_CONTRACT_ADDRESS = "0xFd3001d56fEA038ABfF8E92c31ee187450Ad7FDB";
const DONATION_ADDRESS = "0x0d69307D7D637E2f7196DE74bE4bDEc0A1C25427";

export default function Home() {
  const { user, status, composeCast } = useFarcasterMiniApp();
  
  // Ayrıştırılmış bağlantı kancaları
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  // --- Donation Hooks (Base Mainnet) ---
  const { data: donateHash, sendTransaction, isPending: isDonatePending } = useSendTransaction();
  const { isSuccess: isDonateConfirmed } = useWaitForTransactionReceipt({ hash: donateHash });

  // --- Mint Hooks (Base Sepolia) ---
  const { data: mintHash, writeContract: mintNFT, isPending: isMintPending } = useWriteContract();
  const { isLoading: isMintConfirming, isSuccess: isMintConfirmed } = useWaitForTransactionReceipt({ hash: mintHash });

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Success Auto-Casts
  useEffect(() => {
    if (isDonateConfirmed) {
      composeCast(`I just donated to HelloBase on Base Mainnet! 🔵🚀\nTX: https://basescan.org/tx/${donateHash}`);
    }
  }, [isDonateConfirmed, donateHash, composeCast]);

  useEffect(() => {
    if (isMintConfirmed) {
      composeCast(`I just minted a free NFT on Base Sepolia! 🎨🔥\nTX: https://sepolia.basescan.org/tx/${mintHash}`);
    }
  }, [isMintConfirmed, mintHash, composeCast]);

  // ACTION HANDLERS
  const handleMintAction = async () => {
    if (currentChainId !== baseSepolia.id) {
      switchChain({ chainId: baseSepolia.id });
      return;
    }
    mintNFT({
      address: NFT_CONTRACT_ADDRESS as `0x${string}`,
      abi: [{ name: 'mint', type: 'function', stateMutability: 'nonpayable', inputs: [] }],
      functionName: 'mint',
    });
  };

  const handleDonateAction = async () => {
    if (currentChainId !== base.id) {
      switchChain({ chainId: base.id });
      return;
    }
    sendTransaction({ 
      to: DONATION_ADDRESS as `0x${string}`, 
      value: parseEther('0.001') 
    });
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col items-center p-6 bg-black text-white font-sans">
      <h1 className="text-3xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 italic uppercase">
        HelloBase Hybrid
      </h1>

      <div className="w-full max-w-sm flex flex-col gap-6">
        {!isConnected ? (
          <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 text-center">
            {connectors.map((conn: Connector) => (
              <button 
                key={conn.uid} 
                onClick={() => connect({ connector: conn })} 
                className="w-full py-4 bg-white text-black font-bold rounded-2xl mb-2 hover:bg-zinc-200"
              >
                Connect {conn.name}
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* MINT BLOCK - TESTNET */}
            <div className="p-5 bg-zinc-900 rounded-3xl border border-purple-500/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Testnet Action</h2>
                <span className="text-[9px] text-zinc-500 uppercase">Base Sepolia</span>
              </div>
              <button 
                onClick={handleMintAction}
                disabled={isMintPending || isMintConfirming}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl text-sm font-black uppercase transition-all shadow-lg shadow-purple-900/20"
              >
                {currentChainId !== baseSepolia.id ? "Switch to Sepolia" : 
                 isMintPending ? "Check Wallet..." : 
                 isMintConfirming ? "Minting..." : "Mint Free NFT"}
              </button>
            </div>

            {/* DONATE BLOCK - MAINNET */}
            <div className="p-5 bg-zinc-900 rounded-3xl border border-blue-500/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Mainnet Action</h2>
                <span className="text-[9px] text-zinc-500 uppercase">Base Mainnet</span>
              </div>
              <button 
                onClick={handleDonateAction}
                disabled={isDonatePending}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-sm font-black uppercase transition-all shadow-lg shadow-blue-900/20"
              >
                {currentChainId !== base.id ? "Switch to Mainnet" : 
                 isDonatePending ? "Check Wallet..." : "Donate 0.001 ETH"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-zinc-600 font-mono mb-2">{address}</p>
              <button onClick={() => disconnect()} className="text-[10px] text-zinc-500 hover:text-white underline">
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}