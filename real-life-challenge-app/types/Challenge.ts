export type ChallengeType = "location" | "photo" | "movement"

export type ChallengeStatus = "ongoing" | "completed" | "expired"

export type ValidationResult = "success" | "wrong" | null

export interface Challenge {
    id: string
    templateId: string
    type: ChallengeType
    title: string
    description: string
    status: ChallengeStatus
    deadline: number // timestamp (end of day)

    requiredObject?: string // e.g. a specific color or object
    distanceMeters?: number
    requiredColor?: string
    photoUri?: string // for photo challenges
    photoBase64?: string // base64 encoded photo for validation
}

export type ChallengeContextType = {
    challenges: Challenge[]
    load: () => Promise<Challenge[]>
    addChallenge: (challenge: Challenge) => void
    completeChallenge: (id: string) => void
    updateChallenge: (id: string, updates: Partial<Challenge>) => void
    removeChallenge: (id: string) => void
    isLoading: boolean
}

export type ChallengeTemplate = {
    templateId: string;
    type: Challenge["type"];
    title: string;
    description: string;
    generate: () => Partial<Challenge>;
};