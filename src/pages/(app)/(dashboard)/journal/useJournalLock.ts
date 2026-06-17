import { useState, useCallback, useEffect } from "react";

const HASH_KEY = "journal_lock_hash_v1";
const SALT_KEY = "journal_lock_salt_v1";
const BIOMETRIC_KEY = "journal_biometric_cred_v1";
const SESSION_KEY = "journal_session_unlocked";

async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + salt);
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomHex(bytes: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function useJournalLock() {
  const [isUnlocked, setIsUnlocked] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1"
  );
  const [hasPin, setHasPin] = useState(() => !!localStorage.getItem(HASH_KEY));
  const [hasBiometric, setHasBiometric] = useState(
    () => !!localStorage.getItem(BIOMETRIC_KEY)
  );
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setBiometricSupported)
        .catch(() => setBiometricSupported(false));
    }
  }, []);

  const lock = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsUnlocked(false);
  }, []);

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    const stored = localStorage.getItem(HASH_KEY);
    const salt = localStorage.getItem(SALT_KEY);
    if (!stored || !salt) return false;
    const hash = await hashPin(pin, salt);
    if (hash === stored) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setIsUnlocked(true);
      return true;
    }
    return false;
  }, []);

  const setupPin = useCallback(async (pin: string): Promise<void> => {
    const salt = randomHex(16);
    const hash = await hashPin(pin, salt);
    localStorage.setItem(SALT_KEY, salt);
    localStorage.setItem(HASH_KEY, hash);
    setHasPin(true);
    // intentionally does NOT unlock — call forceUnlock() after biometric offer
  }, []);

  const forceUnlock = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setIsUnlocked(true);
  }, []);

  const changePin = useCallback(
    async (currentPin: string, newPin: string): Promise<boolean> => {
      const stored = localStorage.getItem(HASH_KEY);
      const salt = localStorage.getItem(SALT_KEY);
      if (!stored || !salt) return false;
      const hash = await hashPin(currentPin, salt);
      if (hash !== stored) return false;
      const newSalt = randomHex(16);
      const newHash = await hashPin(newPin, newSalt);
      localStorage.setItem(SALT_KEY, newSalt);
      localStorage.setItem(HASH_KEY, newHash);
      return true;
    },
    []
  );

  const registerBiometric = useCallback(async (): Promise<boolean> => {
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "CoreLog Journal", id: window.location.hostname },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: "journal-user",
            displayName: "Journal",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential;
      const credId = btoa(
        String.fromCharCode(...new Uint8Array(credential.rawId))
      );
      localStorage.setItem(BIOMETRIC_KEY, credId);
      setHasBiometric(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    try {
      const credIdStr = localStorage.getItem(BIOMETRIC_KEY);
      if (!credIdStr) return false;
      const credIdBytes = Uint8Array.from(atob(credIdStr), (c) =>
        c.charCodeAt(0)
      );
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ id: credIdBytes, type: "public-key" }],
          userVerification: "required",
          timeout: 60000,
        },
      });
      sessionStorage.setItem(SESSION_KEY, "1");
      setIsUnlocked(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const removeBiometric = useCallback(() => {
    localStorage.removeItem(BIOMETRIC_KEY);
    setHasBiometric(false);
  }, []);

  const resetLock = useCallback(() => {
    localStorage.removeItem(HASH_KEY);
    localStorage.removeItem(SALT_KEY);
    localStorage.removeItem(BIOMETRIC_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setHasPin(false);
    setHasBiometric(false);
    setIsUnlocked(false);
  }, []);

  return {
    isUnlocked,
    hasPin,
    hasBiometric,
    biometricSupported,
    unlock,
    unlockWithBiometric,
    setupPin,
    forceUnlock,
    changePin,
    registerBiometric,
    removeBiometric,
    resetLock,
    lock,
  };
}

export type JournalLockAPI = ReturnType<typeof useJournalLock>;
