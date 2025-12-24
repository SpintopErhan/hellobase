"use client";

export const dynamic = "force-dynamic";

import { useState, FormEvent, useEffect } from "react";
import { useFarcasterMiniApp } from "@/hooks/useFarcasterMiniApp";
import { useAccount, useConnect, useDisconnect, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem'; // Miktarı ayarlamak için gerekli

export default function Home() {
  const { user, status, error, composeCast } = useFarcasterMiniApp();
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // --- Bağış (Transaction) Hook'ları ---
  const { data: hash, sendTransaction, isPending: isTxPending, error: txError } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [castText, setCastText] = useState<string>("");
  const [isCasting, setIsCasting] = useState<boolean>(false);
  const [castError, setCastError] = useState<string | null>(null);
  const [castSuccess, setCastSuccess] = useState<boolean>(false);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleComposeCast = async (e: FormEvent) => {
    e.preventDefault();
    if (!castText.trim()) {
      setCastError("Please enter some text.");
      return;
    }
    setCastError(null);
    setCastSuccess(false);
    setIsCasting(true);

    try {
      await composeCast(castText);
      setCastText("");
      setCastSuccess(true);
    } catch (err: unknown) {
      setCastError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsCasting(false);
    }
  };

  // --- Bağış Fonksiyonu ---
  const handleDonate = () => {
    sendTransaction({
      to: '0xa1DADEb0d1fae2A11Bcc2d75f3cFab08842aEBa5', // BURAYI DEĞİŞTİR: Bağışın gideceği adres
      value: parseEther('0.0001'), // Test için küçük bir miktar (0.0001 ETH)
    });
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Farcaster MiniApp</h1>

      <div className="mb-6 text-lg text-center">
        {status === "loading" && <p className="text-yellow-400">Loading Farcaster SDK...</p>}
        {status === "error" && <p className="text-red-500">Error: {error?.message}</p>}
        {status === "loaded" && (
          <p>
            Welcome, <span className="font-semibold text-green-400">{user.displayName}</span> (FID: {user.fid})
          </p>
        )}
      </div>

      {/* --- Cüzdan ve Bağış Bölümü --- */}
      <div className="mb-8 p-4 bg-gray-700 rounded-lg shadow-md w-full max-w-md text-center border border-purple-500/30">
        <h2 className="text-xl font-semibold mb-2 text-purple-400">Base Wallet & Support</h2>
        {isConnected ? (
          <div className="flex flex-col gap-3">
            <p className="text-green-300">Connected to {connector?.name}</p>
            <p className="text-[10px] font-mono break-all bg-black/30 p-2 rounded">{address}</p>
            
            {/* Bağış Butonu */}
            <button
              onClick={handleDonate}
              disabled={isTxPending || isConfirming}
              className={`py-3 px-4 rounded-md font-bold text-white transition-all ${
                isTxPending || isConfirming ? "bg-gray-600 cursor-wait" : "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20"
              }`}
            >
              {isTxPending ? "Confirm in Wallet..." : isConfirming ? "Processing TX..." : "Donate 0.0001 ETH"}
            </button>

            {/* İşlem Durum Mesajları */}
            {isConfirmed && <p className="text-xs text-green-400 font-bold">🎉 Donation Successful!</p>}
            {txError && <p className="text-xs text-red-400">Error: {txError.message.split('.')[0]}</p>}

            <button
              onClick={() => disconnect()}
              className="mt-2 text-xs text-gray-400 hover:text-red-400 underline"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {connectors.map((conn) => (
              <button
                key={conn.uid}
                onClick={() => connect({ connector: conn })}
                className="mt-2 py-2 px-4 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm"
              >
                Connect {conn.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg border border-blue-500/20">
        <h2 className="text-2xl font-semibold mb-4 text-center">Create New Cast</h2>
        <form onSubmit={handleComposeCast} className="flex flex-col gap-4">
          <textarea
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            rows={4}
            placeholder="What's on your mind?"
            value={castText}
            onChange={(e) => setCastText(e.target.value)}
            disabled={status !== "loaded" || isCasting}
          ></textarea>
          <button
            type="submit"
            className={`py-3 px-6 rounded-md font-bold text-white transition-all ${
              status !== "loaded" || isCasting ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={status !== "loaded" || isCasting}
          >
            {isCasting ? "Sending..." : "Cast"}
          </button>
        </form>
        {castError && <p className="mt-4 text-red-400 text-center">{castError}</p>}
        {castSuccess && <p className="mt-4 text-green-400 text-center">Cast sent successfully!</p>}
      </div>
    </div>
  );
}