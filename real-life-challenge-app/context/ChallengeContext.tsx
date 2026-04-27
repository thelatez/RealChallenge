import { useChallenges } from "@/hooks/useChallenges";
import { createContext, useContext } from "react";
import type { ChallengeContextType } from "@/types/Challenge";

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined)

export function ChallengeProvider({children}: any) {
    const challengeState = useChallenges();

    return (
        <ChallengeContext.Provider value={challengeState}>
            {children}
        </ChallengeContext.Provider>
    )
}

export function useChallengeContext() {
    const context = useContext(ChallengeContext);
    if (!context) {
        throw new Error("useChallengeContext must be used within ChallengeProvider");
    }
    return context;
}