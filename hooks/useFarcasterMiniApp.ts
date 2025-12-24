//hooks/useFarcasterMiniApp.ts

"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { FarcasterUser, ANONYMOUS_USER } from "@/types/farcaster";

type FarcasterSDKStatus = "idle" | "loading" | "loaded" | "error";

interface UseFarcasterMiniAppResult {
  user: FarcasterUser;
  status: FarcasterSDKStatus;
  error: Error | null;
  composeCast: (text: string, embeds?: string[]) => Promise<void>;
  sdkActions: typeof sdk.actions | null;
}

// addMiniApp çağrısının başarısız olduğunu gösteren tipik TypeError mesajını sabit olarak tanımlayalım
const ADD_MINI_APP_FAILURE_TYPE_ERROR = "Cannot read properties of undefined (reading 'result')";
// Uygulamanın kendi URL'sini bir sabit olarak tanımlayalım
const APP_EMBED_URL = "https://hellobase.vercel.app/";

export const useFarcasterMiniApp = (): UseFarcasterMiniAppResult => {
  const [user, setUser] = useState<FarcasterUser>(ANONYMOUS_USER);
  const [status, setStatus] = useState<FarcasterSDKStatus>("idle");
  const [error, setError] = useState<Error | null>(null);

  const hasInitializedSDKRef = useRef(false);

  useEffect(() => {
   const init = async () => {
  if (hasInitializedSDKRef.current) return;
  if (!sdk) return;

  hasInitializedSDKRef.current = true;
  setStatus("loading");

  try {
    // 1. Önce SDK'yı hazırla
    console.log("[FarcasterSDK] Ready çağrılıyor...");
    await sdk.actions.ready({ disableNativeGestures: true });

    // 2. Base App uyumluluğu için Context'i al (Bağlamı bilmek hata yönetimini kolaylaştırır)
    const context = await sdk.context;
    console.log("[FarcasterSDK] Context:", context);

    // 3. addMiniApp çağrısı (Base App burada 'compatibility' modunda devreye girer)
    try {
      console.log("[FarcasterSDK] addMiniApp deneniyor...");
      // Base App bu çağrıyı yakalayıp kendi "Add" popup'ını açacaktır.
      const result = await sdk.actions.addMiniApp();
      console.log("[FarcasterSDK] addMiniApp başarılı:", result);
    } catch (addErr: any) {
      // Base App içinde 'result' okunamama hatasını burada yutuyoruz ki uygulama çökmesin.
      if (addErr?.message?.includes('result') || addErr instanceof TypeError) {
        console.warn("[FarcasterSDK] Base App uyumluluk uyarısı: Add işlemi cüzdan tarafından yönetiliyor.");
      } else {
        console.error("[FarcasterSDK] addMiniApp hatası:", addErr);
      }
    }

    // 4. Kullanıcı verilerini ayarla
    if (context?.user) {
      setUser({
        fid: context.user.fid,
        username: context.user.username || "anonymous",
        displayName: context.user.displayName || context.user.username || `User ${context.user.fid}`,
      });
    }

    setStatus("loaded");
  } catch (err: unknown) {
    console.error("[FarcasterSDK] Kritik hata:", err);
    setError(err instanceof Error ? err : new Error(String(err)));
    setStatus("error");
  }
};

    init();
  }, []); // Bağımlılık dizisi boş kalmalı, init sadece bir kez çalışmalı.

  const composeCast = useCallback(
    async (text: string, rawEmbeds: string[] = []) => {
      if (status !== "loaded") {
        const castError = new Error("SDK yüklenmediği için cast oluşturulamadı.");
        console.warn("[FarcasterSDK] Cast hatası: SDK yüklü değil.", castError.message);
        throw castError;
      }
      if (user.fid === ANONYMOUS_USER.fid) { // ANONYMOUS_USER.fid doğrudan kontrol edildi
        const authError = new Error("Cast oluşturmak için bir Farcaster kullanıcısı olarak oturum açmış olmalısınız.");
        console.warn("[FarcasterSDK] Cast hatası: Oturum açılmamış.");
        throw authError;
      }

      // Hata Düzeltildi: `let` yerine `const` kullanıldı
      const finalEmbeds = [...rawEmbeds]; // Mevcut embed'leri kopyala

      // Uygulama URL'sini ekle (eğer zaten yoksa)
      // Bu kontrol, manuel olarak rawEmbeds'e eklense bile çiftlemeyi önler
      if (!finalEmbeds.includes(APP_EMBED_URL)) {
          // APP_EMBED_URL'i her zaman ilk embed olarak ekle
          finalEmbeds.unshift(APP_EMBED_URL);
      }

      // Sadece ilk iki embed'i al (Farcaster'ın 2 embed limiti var)
      let embedsForSDK: [] | [string] | [string, string] | undefined;
      if (finalEmbeds.length === 0) {
        embedsForSDK = undefined;
      } else if (finalEmbeds.length === 1) {
        embedsForSDK = [finalEmbeds[0]];
      } else { // finalEmbeds.length >= 2
        embedsForSDK = [finalEmbeds[0], finalEmbeds[1]];
        if (finalEmbeds.length > 2) {
            console.warn("[FarcasterSDK] Uyarı: Farcaster API sadece ilk 2 embed'i destekler. Fazlası göz ardı edildi.");
        }
      }

      try {
        console.log("[FarcasterSDK] Cast oluşturuluyor:", { text, embeds: embedsForSDK });
        await sdk.actions.composeCast({ text, embeds: embedsForSDK });
        console.log("[FarcasterSDK] Cast başarıyla oluşturuldu.");
      } catch (err: unknown) {
        console.error("[FarcasterSDK] Cast oluşturulurken hata:", err);
        throw err instanceof Error ? err : new Error(String(err));
      }
    },
    [status, user.fid] // Sadece `status` ve `user.fid` değiştiğinde yeniden oluşturulur
  );

  const memoizedSdkActions = useMemo(() => (status === "loaded" ? sdk.actions : null), [status]);

  return { user, status, error, composeCast, sdkActions: memoizedSdkActions };
};