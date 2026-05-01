import { Challenge } from "@/types/Challenge";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "CHALLENGES"

export async function saveChallenges(challenges: Challenge[]) {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(challenges))
    } catch (error) {
        console.error("Error saving challenges:", error)
    }
}

export async function loadChallenges(): Promise<Challenge[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY)
        if (data) {
            return JSON.parse(data) as Challenge[]
        }
    } catch (error) {
        console.error("Error loading challenges:", error)
    }
    return []
}

export async function clearChallenges() {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error("Error clearing challenges:", error)
    }
}