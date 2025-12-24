"use client";

export const dynamic = "force-dynamic";

import { useState, FormEvent, useEffect } from "react";
import { useFarcasterMiniApp } from "@/hooks/useFarcasterMiniApp";
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useSendTransaction, 
  useWaitForTransactionReceipt,
  useWriteContract 
} from 'wagmi';
import { parseEther } from 'viem';

// Replace with your Remix Contract Address
const NFT_CONTRACT_ADDRESS = "0xSizinKontratAdresinizBuraya"; 

export default function Home() {
  const { user, status, composeCast } = useFarcasterMiniApp();
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // --- Donation Hooks ---
  const { data: donateHash, sendTransaction, isPending: isDonatePending } = useSendTransaction();
  const { isSuccess: isDonateConfirmed } = useWaitForTransactionReceipt({ hash: donateHash });

  // --- MINT Hooks ---
  const { data: mintHash, writeContract: mintNFT, isPending: isMintPending } = useWriteContract();
  const { isLoading: isMintConfirming, isSuccess: isMintConfirmed } = useWaitForTransactionReceipt({ hash: mintHash });

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Auto-Cast when DONATION is confirmed
  useEffect(() => {
    if (isDonateConfirmed) {
      composeCast(`I just donated to HelloBase! 🚀\nTX: https://sepolia.basescan.org/tx/${donateHash}`);
    }
  }, [isDonateConfirmed, donateHash, composeCast]);

  // Auto-Cast when MINT is confirmed
  useEffect(() => {
    if (isMintConfirmed) {
      composeCast(`I just minted a free NFT from the HelloBase Collection! 🎨🔥\n\nCheck it out: https://sepolia.basescan.org/tx/${mintHash}`);
    }
  }, [isMintConfirmed, mintHash, composeCast]);

  const handleMint = () => {
    mintNFT({
      address: NFT_CONTRACT_ADDRESS as `0x${string}`,
      abi: [{ name: 'mint', type: 'function', stateMutability: 'nonpayable', inputs: [] }],
      functionName: 'mint',
    });
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col items-center p-6 bg-black text-white font-sans">
      <h1 className="text-3xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 italic">
        HELLO BASE
      </h1>

      {status === "loading" && <p className="text-zinc-500 animate-pulse">Initializing SDK...</p>}

      {status === "loaded" && (
        <div className="mb-6 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-xs">
          Logged in as: <span className="text-blue-400 font-bold">@{user.username}</span>
        </div>
      )}

      <div className="w-full max-w-sm flex flex-col gap-6">
        
        {/* WALLET & ACTIONS SECTION */}
        <div className="p-5 bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl">
          <h2 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-widest text-center">Wallet Actions</h2>
          
          {!isConnected ? (
            <div className="flex flex-col gap-2">
              {connectors.map((conn) => (
                <button 
                  key={conn.uid} 
                  onClick={() => connect({ connector: conn })} 
                  className="w-full py-3 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-colors"
                >
                  Connect {conn.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="text-center p-3 bg-black/50 rounded-2xl border border-white/5">
                <p className="text-[10px] text-zinc-500 font-mono break-all">{address}</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Mint Button - Primary Action */}
                <button 
                  onClick={handleMint}
                  disabled={isMintPending || isMintConfirming}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-2xl text-sm font-black uppercase shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isMintPending ? "Confirming..." : isMintConfirming ? "Minting NFT..." : "Claim Free NFT"}
                </button>

                {/* Donate Button - Secondary Action */}
                <button 
                  onClick={() => sendTransaction({ to: '0xSizinAdresiniz', value: parseEther('0.0001') })}
                  disabled={isDonatePending}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-xs font-bold text-zinc-300 transition-all"
                >
                  {isDonatePending ? "Sending..." : "Donate 0.0001 ETH"}
                </button>
              </div>

              {isMintConfirmed && (
                <p className="text-[10px] text-green-400 font-bold text-center animate-bounce">
                  ✨ Success! Opening Cast composer...
                </p>
              )}

              <button 
                onClick={() => disconnect()} 
                className="mt-2 text-[10px] text-zinc-600 hover:text-red-400 transition-colors underline decoration-zinc-800"
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>

        {/* INFO FOOTER */}
        <div className="text-center">
          <p className="text-zinc-600 text-[10px]">
            Powered by <span className="text-zinc-400">Base Sepolia</span> & <span className="text-zinc-400">Farcaster v2</span>
          </p>
        </div>

      </div>
    </div>
  );
}