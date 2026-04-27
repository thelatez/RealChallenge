import { loadChallenges } from "@/services/storageService";
import { Challenge } from "@/types/Challenge";
import { useState } from "react";

export function useChallenges() {
    const [challenges, setChallenges] = useState<Challenge[]>([])

    async function load() {
        const data = await loadChallenges()
        setChallenges(data)
    }

    function addChallenge(challenge: Challenge) {}

    function completeChallenge(id: string) {}

    return {
        challenges, load, addChallenge, completeChallenge
    }
}