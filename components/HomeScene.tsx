"use client";

export const dynamic = "force-dynamic";

import { useState, FormEvent, useEffect } from "react";
import { useFarcasterMiniApp } from "@/hooks/useFarcasterMiniApp";
import { useAccount, useConnect, useDisconnect, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

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

  // --- KRİTİK EKLEME: İşlem Onaylandığında Cast Penceresini Aç ---
  useEffect(() => {
    if (isConfirmed) {
      console.log("İşlem onaylandı, Cast taslağı hazırlanıyor...");
      
      // Kullanıcıya işlem biter bitmez Cast penceresini açıyoruz
      const triggerSuccessCast = async () => {
        try {
          await composeCast(`HelloBase üzerinden az önce bağış yaptım! 🚀 \n\nİşlem Özeti: https://basescan.org/tx/${hash}`);
        } catch (err) {
          console.error("Otomatik Cast penceresi açılamadı:", err);
        }
      };

      triggerSuccessCast();
    }
  }, [isConfirmed, hash, composeCast]);

  const handleComposeCast = async (e: FormEvent) => {
    e.preventDefault();
    if (!castText.trim()) return;
    setIsCasting(true);
    try {
      await composeCast(castText);
      setCastText("");
      setCastSuccess(true);
    } catch (err: any) {
      setCastError(err.message);
    } finally {
      setIsCasting(false);
    }
  };

  const handleDonate = () => {
    sendTransaction({
      to: '0xa1DADEb0d1fae2A11Bcc2d75f3cFab08842aEBa5', // Kendi adresinizi buraya yazın
      value: parseEther('0.0001'),
    });
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Farcaster MiniApp</h1>

      {/* Kullanıcı Bilgisi */}
      <div className="mb-6 text-lg text-center">
        {status === "loaded" && (
          <p>Welcome, <span className="font-semibold text-green-400">{user.displayName}</span></p>
        )}
      </div>

      {/* Cüzdan ve Bağış Kartı */}
      <div className="mb-8 p-6 bg-gray-800 rounded-xl shadow-2xl w-full max-w-md text-center border border-blue-500/20">
        <h2 className="text-xl font-semibold mb-4 text-purple-400">Onchain Action</h2>
        
        {isConnected ? (
          <div className="flex flex-col gap-4">
            <div className="bg-black/40 p-3 rounded-lg text-[10px] font-mono break-all border border-white/10">
              {address}
            </div>

            <button
              onClick={handleDonate}
              disabled={isTxPending || isConfirming}
              className={`py-3 px-4 rounded-lg font-bold text-white transition-all transform active:scale-95 ${
                isTxPending || isConfirming 
                  ? "bg-gray-600 cursor-wait" 
                  : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-900/40"
              }`}
            >
              {isTxPending ? "Cüzdan Onayı Bekleniyor..." : 
               isConfirming ? "İşlem Onaylanıyor..." : 
               "0.0001 ETH Bağışla"}
            </button>

            {isConfirmed && (
              <div className="animate-bounce text-sm text-green-400 font-bold mt-2">
                ✅ İşlem Başarılı! Cast penceresi açılıyor...
              </div>
            )}
            
            {txError && (
              <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
                Hata: {txError.message.split('.')[0]}
              </p>
            )}

            <button onClick={() => disconnect()} className="text-xs text-gray-500 hover:text-red-400 underline transition-colors">
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-400 mb-2">İşlem yapmak için cüzdan bağla</p>
            {connectors.map((conn) => (
              <button
                key={conn.uid}
                onClick={() => connect({ connector: conn })}
                className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold transition-colors"
              >
                {conn.name} ile Bağlan
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Manuel Cast Alanı */}
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-xl border border-white/5 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Mesaj Gönder</h3>
        <form onSubmit={handleComposeCast} className="flex flex-col gap-3">
          <textarea
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
            rows={3}
            placeholder="Neler oluyor?"
            value={castText}
            onChange={(e) => setCastText(e.target.value)}
          />
          <button
            type="submit"
            disabled={isCasting}
            className="py-2 px-6 rounded-lg bg-blue-500 hover:bg-blue-400 font-bold disabled:bg-gray-700 transition-all"
          >
            {isCasting ? "Gönderiliyor..." : "Cast At"}
          </button>
        </form>
      </div>
    </div>
  );
}