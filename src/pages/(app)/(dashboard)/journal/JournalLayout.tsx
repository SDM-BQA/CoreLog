import { Outlet } from "react-router-dom";
import { useJournalLock } from "./useJournalLock";
import JournalLock from "./JournalLock";
import { useAppSelector } from "../../../../@store/hooks/store.hooks";

const JournalLayout = () => {
  const lock = useJournalLock();
  const { user } = useAppSelector((state) => state.user);

  if (!lock.hasPin || !lock.isUnlocked) {
    return (
      <JournalLock
        hasPin={lock.hasPin}
        hasBiometric={lock.hasBiometric}
        biometricSupported={lock.biometricSupported}
        unlock={lock.unlock}
        unlockWithBiometric={lock.unlockWithBiometric}
        setupPin={lock.setupPin}
        forceUnlock={lock.forceUnlock}
        registerBiometric={lock.registerBiometric}
        resetLock={lock.resetLock}
        userEmail={user?.email_id}
      />
    );
  }

  return <Outlet context={lock} />;
};

export default JournalLayout;
