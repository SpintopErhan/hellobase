// app/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useFarcasterMiniApp } from "@/hooks/useFarcasterMiniApp";

// Wagmi hook'larını page.tsx'ten import etmeye devam ediyoruz.
// Artık Providers layout.tsx'te sarılı olduğu için buradaki kullanımlar geçerli olacak.
import { useAccount, useConnect, useDisconnect } from 'wagmi';

// Wagmi Config, QueryClient, injected, createPublicClient vb. importlarını BURADAN KALDIRIN.
// Bunlar artık app/providers.tsx dosyasında tanımlı.

export default function Home() {
  const { user, status, error, composeCast } = useFarcasterMiniApp();

  // Bu Wagmi hook'ları artık layout.tsx'teki Providers tarafından sağlanacak.
  // Bu yüzden burada kullanımları geçerli olacak ve hata vermeyecek.
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [castText, setCastText] = useState<string>("");
  const [isCasting, setIsCasting] = useState<boolean>(false);
  const [castError, setCastError] = useState<string | null>(null);
  const [castSuccess, setCastSuccess] = useState<boolean>(false);

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
      console.log("Cast sent successfully!");
    } catch (err: unknown) {
      console.error("Error casting:", err);
      if (err instanceof Error) {
        setCastError(err.message);
      } else {
        setCastError("An unknown error occurred while casting.");
      }
    } finally {
      setIsCasting(false);
    }
  };

  return (
    // !!! DÜZELTME: Providers bileşeni artık burada kullanılmayacak, app/layout.tsx'te kullanılacak.
    // WagmiProvider ve QueryClientProvider artık layout'ta sarılı olduğu için buradaki tüm Wagmi hook'ları çalışır.
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Farcaster MiniApp</h1>

      <div className="mb-6 text-lg text-center">
        {status === "loading" && <p className="text-yellow-400">Loading Farcaster SDK...</p>}
        {status === "error" && <p className="text-red-500">Error: {error?.message || "An unknown error occurred."}</p>}
        {status === "loaded" && (
          <p>
            Welcome,{" "}
            <span className="font-semibold text-green-400">
              {user.displayName}
            </span>{" "}
            (FID: {user.fid})
          </p>
        )}
        {user.fid === 0 && (
          <p className="text-red-300 mt-2">
            You might need to log in to Farcaster to use the MiniApp.
          </p>
        )}
      </div>

      <div className="mb-8 p-4 bg-gray-700 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-xl font-semibold mb-2 text-purple-400">Base Wallet</h2>
        {isConnected ? (
          <>
            <p className="text-green-300">Connected to {connector?.name}</p>
            <p className="text-sm break-all">Address: <span className="font-mono">{address}</span></p>
            <button
              onClick={() => disconnect()}
              className="mt-3 py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Disconnect
            </button>
          </>
        ) : (
          <>
            <p className="text-yellow-300">Wallet not connected.</p>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                className="mt-3 mr-2 py-2 px-4 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-bold"
                disabled={!connector.ready}
              >
                Connect with {connector.name}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Create New Cast</h2>
        <form onSubmit={handleComposeCast} className="flex flex-col gap-4">
          <textarea
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            rows={4}
            placeholder="What's on your mind?"
            value={castText}
            onChange={(e) => setCastText(e.target.value)}
            disabled={status !== "loaded" || user.fid === 0 || isCasting}
          ></textarea>
          <button
            type="submit"
            className={`py-3 px-6 rounded-md font-bold text-white transition-colors duration-200 ${
              status !== "loaded" || user.fid === 0 || isCasting
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={status !== "loaded" || user.fid === 0 || isCasting}
          >
            {isCasting ? "Sending..." : "Cast"}
          </button>
        </form>

        {castError && (
          <p className="mt-4 text-red-400 text-center">{castError}</p>
        )}
        {castSuccess && (
          <p className="mt-4 text-green-400 text-center">Cast sent successfully!</p>
        )}
      </div>
    </div>
  );
}