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
  type Connector 
} from 'wagmi';
import { parseEther } from 'viem';
import { base, baseSepolia } from 'wagmi/chains';

const NFT_CONTRACT_ADDRESS = "0x3125bB022ea7c7175BadC0e6adECC8E86101c88C";
const DONATION_ADDRESS = "0x0d69307D7D637E2f7196DE74bE4bDEc0A1C25427";

export default function Home() {
  const { user, status, composeCast } = useFarcasterMiniApp();
  
  // Hooks separation for cleaner logic
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  // --- Donation Hooks (Target: Base Mainnet) ---
  const { data: donateHash, sendTransaction, isPending: isDonatePending } = useSendTransaction();
  const { isSuccess: isDonateConfirmed } = useWaitForTransactionReceipt({ hash: donateHash });

  // --- MINT Hooks (Target: Base Sepolia) ---
  const { data: mintHash, writeContract: mintNFT, isPending: isMintPending } = useWriteContract();
  const { isLoading: isMintConfirming, isSuccess: isMintConfirmed } = useWaitForTransactionReceipt({ hash: mintHash });

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Auto-Cast Logic
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

  // ACTION: Mint on Base Sepolia
  const handleMint = async () => {
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

  // ACTION: Donate on Base Mainnet
  const handleDonate = async () => {
    if (currentChainId !== base.id) {
      switchChain({ chainId: base.id });
      return;
    }

    sendTransaction({ 
      to: DONATION_ADDRESS as `0x${string}`, 
      value: parseEther('0.001') // Mainnet donation amount
    });
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col items-center p-6 bg-black text-white font-sans">
      <h1 className="text-3xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 italic uppercase">
        Hello Base
      </h1>

      {status === "loaded" && (
        <div className="mb-6 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-xs">
          Logged in as: <span className="text-blue-400 font-bold">@{user.username}</span>
        </div>
      )}

      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="p-5 bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl">
          <h2 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-widest text-center">Wallet Actions</h2>
          
          {!isConnected ? (
            <div className="flex flex-col gap-2">
              {connectors.map((conn: Connector) => (
                <button 
                  key={conn.uid} 
                  onClick={() => connect({ connector: conn })} 
                  className="w-full py-4 bg-white text-black font-bold rounded-2xl mb-2 hover:bg-zinc-200 transition-colors"
                >
                  Connect {conn.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="text-center p-3 bg-black/50 rounded-2xl border border-white/5">
                <p className="text-[10px] text-zinc-500 font-mono break-all">{address}</p>
                <p className="text-[9px] mt-1 text-zinc-400 uppercase tracking-tighter">
                  Current Network ID: {currentChainId}
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {/* MINT BUTTON (SEPOLIA) */}
                <button 
                  onClick={handleMint}
                  disabled={isMintPending || isMintConfirming}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-2xl text-sm font-black uppercase shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all"
                >
                  {currentChainId !== baseSepolia.id ? "Switch to Sepolia (Mint)" : 
                   isMintPending ? "Confirming..." : 
                   isMintConfirming ? "Minting..." : "Claim Free NFT"}
                </button>

                {/* DONATE BUTTON (MAINNET) */}
                <button 
                  onClick={handleDonate}
                  disabled={isDonatePending}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-xs font-bold text-zinc-300 transition-all border border-zinc-700"
                >
                  {currentChainId !== base.id ? "Switch to Mainnet (Donate)" : 
                   isDonatePending ? "Sending..." : "Donate 0.001 ETH"}
                </button>
              </div>

              {isMintConfirmed && (
                <p className="text-[10px] text-green-400 font-bold text-center animate-bounce">
                  ✨ Mint Successful! Opening Cast...
                </p>
              )}

              <button onClick={() => disconnect()} className="mt-2 text-[10px] text-zinc-600 hover:text-red-400 transition-colors underline text-center">
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-zinc-600 text-[10px]">
            Mint: <span className="text-zinc-400">Base Sepolia</span> | Donate: <span className="text-zinc-400">Base Mainnet</span>
          </p>
        </div>
      </div>
    </div>
  );
}