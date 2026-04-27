export type ChallengeType = "location" | "photo"

export type ChallengeStatus = "ongoing" | "completed" | "missed"

export interface Challenge {
    id: string
    type: ChallengeType
    title: string
    description: string
    status: ChallengeStatus

    targetLocation?: {
        latitude: number
        longitude: number
        radius: number
    }

    requiredObject?: string // e.g. a specific color or object
}

export type ChallengeContextType = {
    challenges: Challenge[]
    load: () => Promise<void>
    addChallenge: (challenge: Challenge) => void
    completeChallenge: (id: string) => void
}