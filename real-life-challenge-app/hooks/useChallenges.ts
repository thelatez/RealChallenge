import { loadChallenges, saveChallenges } from "@/services/storageService";
import { Challenge } from "@/types/Challenge";
import { useEffect, useState } from "react";

export function useChallenges() {
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load challenges on mount
    useEffect(() => {
        const init = async () => {
            const data = await loadChallenges()
            
            // Check for expired challenges
            const now = Date.now()
            const updated = data.map(c => ({
                ...c,
                status: c.status === "ongoing" && now > c.deadline ? "expired" : c.status
            }))
            
            setChallenges(updated)
            setIsLoading(false)
        }
        init()
    }, [])

    // Auto-save whenever challenges change
    useEffect(() => {
        if (!isLoading) {
            saveChallenges(challenges)
        }
    }, [challenges, isLoading])

    function addChallenge(challenge: Challenge) {
        setChallenges(prev => [...prev, challenge])
    }

    function completeChallenge(id: string) {
        setChallenges(prev =>
            prev.map(c => c.id === id ? { ...c, status: "completed" as const } : c)
        )
    }

    function updateChallenge(id: string, updates: Partial<Challenge>) {
        setChallenges(prev =>
            prev.map(c => c.id === id ? { ...c, ...updates } : c)
        )
    }

    function removeChallenge(id: string) {
        setChallenges(prev => prev.filter(c => c.id !== id))
    }

    return {
        challenges, 
        load: loadChallenges, 
        addChallenge, 
        completeChallenge, 
        updateChallenge,
        removeChallenge,
        isLoading
    }
}