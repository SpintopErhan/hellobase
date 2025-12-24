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
  useWriteContract,
  useChainId,      // To check current network
  useSwitchChain   // To force network change
} from 'wagmi';
import { parseEther } from 'viem';
import { baseSepolia } from 'wagmi/chains'; // Import the target chain

const NFT_CONTRACT_ADDRESS = "0xFd3001d56fEA038ABfF8E92c31ee187450Ad7FDB"; 

export default function Home() {
  const { user, status, composeCast } = useFarcasterMiniApp();
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Network Enforcement Tools
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  // --- Donation Hooks ---
  const { data: donateHash, sendTransaction, isPending: isDonatePending } = useSendTransaction();
  const { isSuccess: isDonateConfirmed } = useWaitForTransactionReceipt({ hash: donateHash });

  // --- MINT Hooks ---
  const { data: mintHash, writeContract: mintNFT, isPending: isMintPending } = useWriteContract();
  const { isLoading: isMintConfirming, isSuccess: isMintConfirmed } = useWaitForTransactionReceipt({ hash: mintHash });

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Auto-Cast Logic
  useEffect(() => {
    if (isDonateConfirmed) {
      composeCast(`I just donated to HelloBase! 🚀\nTX: https://sepolia.basescan.org/tx/${donateHash}`);
    }
  }, [isDonateConfirmed, donateHash, composeCast]);

  useEffect(() => {
    if (isMintConfirmed) {
      composeCast(`I just minted a free NFT from the HelloBase Collection! 🎨🔥\n\nCheck it out: https://sepolia.basescan.org/tx/${mintHash}`);
    }
  }, [isMintConfirmed, mintHash, composeCast]);

  // ENFORCED MINT FUNCTION
  const handleMint = async () => {
    // Check if connected wallet is on Base Sepolia (84532)
    if (currentChainId !== baseSepolia.id) {
      console.log("Wrong network detected. Switching to Base Sepolia...");
      switchChain({ chainId: baseSepolia.id });
      return; // Stop and wait for network switch
    }

    // If on correct network, proceed with mint
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
                {/* Network Indicator */}
                <p className={`text-[9px] mt-1 font-bold ${currentChainId === baseSepolia.id ? 'text-green-500' : 'text-red-500'}`}>
                  Network: {currentChainId === baseSepolia.id ? 'Base Sepolia ✓' : 'Wrong Network (Switching required)'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={handleMint}
                  disabled={isMintPending || isMintConfirming}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-2xl text-sm font-black uppercase shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all active:scale-95"
                >
                  {currentChainId !== baseSepolia.id ? "Switch to Base Sepolia" : 
                   isMintPending ? "Confirming..." : 
                   isMintConfirming ? "Minting NFT..." : "Claim Free NFT"}
                </button>

                <button 
                  onClick={() => {
                    if (currentChainId !== baseSepolia.id) {
                      switchChain({ chainId: baseSepolia.id });
                    } else {
                      sendTransaction({ to: '0x0d69307D7D637E2f7196DE74bE4bDEc0A1C25427', value: parseEther('0.0001') });
                    }
                  }}
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

              <button onClick={() => disconnect()} className="mt-2 text-[10px] text-zinc-600 hover:text-red-400 transition-colors underline decoration-zinc-800 text-center">
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-zinc-600 text-[10px]">
            Powered by <span className="text-zinc-400">Base Sepolia</span> & <span className="text-zinc-400">Farcaster v2</span>
          </p>
        </div>
      </div>
    </div>
  );
}