import { useChallengeContext } from "@/context/ChallengeContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Text, Button, Dialog, Portal, Chip } from "react-native-paper";
import { useState, useEffect } from "react";
import ProgressBar from "@/components/ProgressBar";
import { useLocation } from "@/hooks/useLocation";
import { calculateDistance } from "@/utils/distance";
import { validatePhotoChallenge } from "@/services/challengeValidator";
import { LocationObject } from "expo-location";

export default function ChallengeDetail() {
    const { id } = useLocalSearchParams()
    const router = useRouter()
    const { challenges, updateChallenge, completeChallenge, isLoading } = useChallengeContext()
    const { location, getCurrentLocation } = useLocation()
    
    const challenge = challenges.find(c => c.id === id)
    const [validationMessage, setValidationMessage] = useState("")
    const [dialogVisible, setDialogVisible] = useState(false)
    const [isValidating, setIsValidating] = useState(false)
    const [startLocation, setStartLocation] = useState<LocationObject | null>(null)
    const [distanceTraveled, setDistanceTraveled] = useState(0)

    useEffect(() => {
        if (!isLoading && !challenge && challenges.length > 0) {
            router.back()
        }
    }, [isLoading, challenge, challenges.length])

    if (isLoading || !challenge) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading challenge...</Text>
            </View>
        )
    }

    // MOVEMENT TASK HANDLERS
    const handleStartTracking = async () => {
        await getCurrentLocation()
        setStartLocation(location)
        setDistanceTraveled(0)
    }

    const handleUpdateDistance = async () => {
        if (!startLocation || !location) return
        const dist = calculateDistance(
            startLocation.coords.latitude,
            startLocation.coords.longitude,
            location.coords.latitude,
            location.coords.longitude
        )
        setDistanceTraveled(dist)
    }

    const handleMovementSubmit = async () => {
        setIsValidating(true)
        
        // Movement validation: check if distance is met
        if (challenge.distanceMeters && distanceTraveled >= challenge.distanceMeters) {
            completeChallenge(challenge.id)
            setValidationMessage("✓ Distance completed! Challenge done!")
        } else {
            const remaining = challenge.distanceMeters ? challenge.distanceMeters - distanceTraveled : 0
            setValidationMessage(`✗ Distance not met. ${Math.ceil(remaining)}m remaining.`)
        }
        
        setDialogVisible(true)
        setIsValidating(false)
    }

    // PHOTO TASK HANDLERS
    const handlePhotoSubmit = async (photoUri: string) => {
        setIsValidating(true)
        
        // Photo validation (basic - would integrate with vision API in real app)
        const isValid = await validatePhotoChallenge(photoUri)
        
        if (isValid) {
            updateChallenge(challenge.id, { photoUri, status: "completed" })
            setValidationMessage("✓ Photo accepted! Challenge completed!")
            completeChallenge(challenge.id)
        } else {
            setValidationMessage("✗ Photo doesn't match requirements. Try again!")
            updateChallenge(challenge.id, { photoUri })
        }
        
        setDialogVisible(true)
        setIsValidating(false)
    }

    const getTimeRemaining = () => {
        if (challenge.status === "completed") return "Completed"
        const now = Date.now()
        const remaining = challenge.deadline - now
        if (remaining < 0) return "Expired"
        const minutes = Math.ceil(remaining / 60000)
        const hours = Math.floor(minutes / 60)
        if (hours > 0) return `${hours}h left`
        return `${minutes}m left`
    }

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.header}>
                        <View>
                            <Text variant="headlineSmall">{challenge.title}</Text>
                            <Text variant="bodySmall" style={styles.description}>
                                {challenge.description}
                            </Text>
                        </View>
                        <Chip
                            style={{
                                backgroundColor: challenge.status === "completed" ? "#4CAF50" : "#FF9800"
                            }}
                            textStyle={{ color: "#fff" }}
                        >
                            {getTimeRemaining()}
                        </Chip>
                    </View>

                    {/* MOVEMENT TASK */}
                    {challenge.type === "movement" && (
                        <View style={styles.section}>
                            <Text variant="titleSmall" style={styles.sectionTitle}>Distance Target</Text>
                            <Text variant="displaySmall" style={styles.distance}>
                                {challenge.distanceMeters}m
                            </Text>
                            <Text variant="bodySmall" style={styles.current}>
                                Current: {distanceTraveled.toFixed(0)}m
                            </Text>
                            <ProgressBar 
                                progress={Math.min(distanceTraveled / (challenge.distanceMeters || 1), 1)} 
                            />
                            <View style={styles.buttonGroup}>
                                <Button
                                    mode="contained"
                                    onPress={handleStartTracking}
                                    disabled={challenge.status !== "ongoing" || isValidating}
                                    style={styles.button}
                                >
                                    Start Tracking
                                </Button>
                                <Button
                                    mode="outlined"
                                    onPress={handleUpdateDistance}
                                    disabled={challenge.status !== "ongoing" || isValidating}
                                    style={styles.button}
                                >
                                    Update Location
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleMovementSubmit}
                                    disabled={challenge.status !== "ongoing" || isValidating}
                                    loading={isValidating}
                                    style={styles.button}
                                >
                                    Submit
                                </Button>
                            </View>
                        </View>
                    )}

                    {/* PHOTO TASK */}
                    {challenge.type === "photo" && (
                        <View style={styles.section}>
                            <Text variant="titleSmall" style={styles.sectionTitle}>Photo Required</Text>
                            <Text variant="bodyMedium" style={styles.requirement}>
                                Capture: {challenge.requiredObject || "Something interesting"}
                            </Text>
                            <View style={styles.buttonGroup}>
                                <Button
                                    mode="contained"
                                    onPress={() => console.log("Open camera")} // TODO: integrate camera
                                    disabled={challenge.status !== "ongoing"}
                                    style={styles.button}
                                >
                                    Take Photo
                                </Button>
                                {challenge.photoUri && (
                                    <Button
                                        mode="contained"
                                        onPress={() => handlePhotoSubmit(challenge.photoUri!)}
                                        disabled={challenge.status !== "ongoing" || isValidating}
                                        loading={isValidating}
                                        style={styles.button}
                                    >
                                        Submit Photo
                                    </Button>
                                )}
                            </View>
                        </View>
                    )}

                    {/* STATUS INDICATOR */}
                    {challenge.status === "completed" && (
                        <View style={styles.successBanner}>
                            <Text variant="bodyLarge" style={{ color: "#fff" }}>
                                ✓ Challenge Completed!
                            </Text>
                        </View>
                    )}

                    {challenge.status === "expired" && (
                        <View style={styles.expiredBanner}>
                            <Text variant="bodyLarge" style={{ color: "#fff" }}>
                                ✗ Challenge Expired
                            </Text>
                        </View>
                    )}
                </Card.Content>
            </Card>

            {/* VALIDATION DIALOG */}
            <Portal>
                <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                    <Dialog.Content>
                        <Text variant="bodyLarge">{validationMessage}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            setDialogVisible(false)
                            if (validationMessage.includes("✓")) {
                                router.back()
                            }
                        }}>
                            Done
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        marginBottom: 16,
    },
    header: {
        marginBottom: 24,
        gap: 12,
    },
    description: {
        marginTop: 8,
        color: "#666",
    },
    section: {
        marginTop: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    sectionTitle: {
        marginBottom: 12,
        fontWeight: "600",
    },
    distance: {
        marginVertical: 8,
        color: "#2196F3",
    },
    current: {
        marginBottom: 8,
        color: "#999",
    },
    requirement: {
        marginVertical: 12,
        padding: 12,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
    },
    buttonGroup: {
        marginTop: 16,
        gap: 8,
    },
    button: {
        marginVertical: 4,
    },
    successBanner: {
        marginTop: 24,
        padding: 16,
        backgroundColor: "#4CAF50",
        borderRadius: 8,
        alignItems: "center",
    },
    expiredBanner: {
        marginTop: 24,
        padding: 16,
        backgroundColor: "#F44336",
        borderRadius: 8,
        alignItems: "center",
    },
})