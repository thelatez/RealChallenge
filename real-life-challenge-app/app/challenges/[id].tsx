import { useChallengeContext } from "@/context/ChallengeContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, StyleSheet, ScrollView, Modal, Image } from "react-native";
import { Card, Text, Button, Dialog, Portal, Chip } from "react-native-paper";
import { useState, useEffect } from "react";
import { CameraView } from "expo-camera";
import ProgressBar from "@/components/ProgressBar";
import { useLocation } from "@/hooks/useLocation";
import { useCamera } from "@/hooks/useCamera";
import { calculateDistance } from "@/utils/distance";
import { validatePhotoChallenge } from "@/services/challengeValidator";
import { LocationObject } from "expo-location";

function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

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
    const [photoUri, setPhotoUri] = useState<string | null>(challenge?.photoUri ?? null)
    const [photoBase64, setPhotoBase64] = useState<string | null>(challenge?.photoBase64 ?? null)
    const [cameraVisible, setCameraVisible] = useState(false)
    const [currentCoords, setCurrentCoords] = useState<string>("Not tracked")
    const [startCoords, setStartCoords] = useState<string>("Not set")
    const { cameraRef, hasCameraPermission, permissionMessage, requestCameraPermission, takePictureAsync } = useCamera();
    const isOngoing = challenge?.status === "ongoing"

    useEffect(() => {
        if (challenge?.photoUri) {
            setPhotoUri(challenge.photoUri)
        }
        if (challenge?.photoBase64) {
            setPhotoBase64(challenge.photoBase64)
        }
    }, [challenge?.photoUri, challenge?.photoBase64])

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
        const result = await getCurrentLocation();
        if (!result.success) {
            setValidationMessage(result.message);
            setDialogVisible(true);
            return;
        }

        setStartLocation(result.location);
        setDistanceTraveled(0);

        const coordsStr = `${result.location.coords.latitude.toFixed(6)}, ${result.location.coords.longitude.toFixed(6)}`;
        setStartCoords(coordsStr);
        setCurrentCoords(coordsStr);
        console.log("Started tracking from:", coordsStr);
    }

    const handleUpdateDistance = async () => {
        const result = await getCurrentLocation();
        if (!result.success) {
            setValidationMessage(result.message);
            setDialogVisible(true);
            return;
        }

        if (!startLocation) {
            setValidationMessage("Please start tracking first by pressing 'Start Tracking'.");
            setDialogVisible(true);
            return;
        }

        const dist = calculateDistance(
            startLocation.coords.latitude,
            startLocation.coords.longitude,
            result.location.coords.latitude,
            result.location.coords.longitude
        );
        setDistanceTraveled(dist);
        const coordsStr = `${result.location.coords.latitude.toFixed(6)}, ${result.location.coords.longitude.toFixed(6)}`;
        setCurrentCoords(coordsStr);
        console.log("Updated location to:", coordsStr, "Distance:", dist.toFixed(1), "m");
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

    const handleOpenCamera = async () => {
        const { granted } = await requestCameraPermission();
        setCameraVisible(true);

        if (!granted) {
            return;
        }
    }

    const handleCloseCamera = () => {
        setCameraVisible(false);
    }

    const handleCapturePhoto = async () => {
        try {
            const photo = await takePictureAsync();
            setPhotoUri(photo.uri);
            setPhotoBase64(photo.base64 ?? null);

            if (challenge && photo.uri && photo.base64) {
                updateChallenge(challenge.id, {
                    photoUri: photo.uri,
                    photoBase64: photo.base64,
                });
            }

            setCameraVisible(false);
        } catch (error) {
            console.error("Capture failed:", error);
            setValidationMessage("Unable to capture photo. Please try again.");
            setDialogVisible(true);
        }
    }

    const handlePhotoSubmit = async () => {
        if (!photoBase64) {
            setValidationMessage("Please take a photo before submitting.")
            setDialogVisible(true)
            return
        }

        setIsValidating(true)

        try {
            const isValid = await validatePhotoChallenge(photoBase64, challenge?.requiredObject, challenge?.requiredColor)

            if (isValid) {
                updateChallenge(challenge.id, { photoUri: photoUri ?? undefined, status: "completed" })
                setValidationMessage("✓ Photo accepted! Challenge completed!")
                completeChallenge(challenge.id)
            } else {
                setValidationMessage("✗ Photo doesn't match requirements. Try again!")
                updateChallenge(challenge.id, { photoUri: photoUri ?? undefined })
            }
        } catch (error) {
            console.error("Photo validation error:", error)
            const errorMessage = error instanceof Error ? error.message : "Unknown error"
            if (errorMessage.includes("Network")) {
                setValidationMessage("Error connecting to the server. Please check your internet connection and try again.")
            } else {
                setValidationMessage("Error validating photo. Please try again.")
            }
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
                            <Text variant="bodySmall" style={styles.deadlineText}>
                                Due {formatDate(challenge.deadline)}
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
                            {challenge.status === "completed" || challenge.status === "expired" ? (
                                ""
                            ) : (
                                <Text variant="bodySmall" style={styles.current}>
                                    Current: {distanceTraveled.toFixed(0)}m
                                </Text>
                            )}
                            <ProgressBar 
                                progress={Math.min(distanceTraveled / (challenge.distanceMeters || 1), 1)} 
                            />
                            {/*<View style={styles.locationDebug}>
                                <Text variant="labelSmall" style={styles.debugLabel}>📍 Debug Info:</Text>
                                <Text variant="bodySmall" style={styles.debugText}>Start: {startCoords}</Text>
                                <Text variant="bodySmall" style={styles.debugText}>Current: {currentCoords}</Text>
                            </View>*/}
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
                                    disabled={challenge.status !== "ongoing" || isValidating || distanceTraveled < challenge?.distanceMeters!}
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
                                Capture: {challenge.requiredObject || challenge.requiredColor || "Something interesting"}
                            </Text>
                            {photoUri && (
                                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                            )}
                            <View style={styles.buttonGroup}>
                                <Button
                                    mode="contained"
                                    onPress={handleOpenCamera}
                                    disabled={!isOngoing}
                                    style={styles.button}
                                >
                                    Take Photo
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handlePhotoSubmit}
                                    disabled={!isOngoing || isValidating || !photoUri}
                                    loading={isValidating}
                                    style={styles.button}
                                >
                                    Submit Photo
                                </Button>
                            </View>
                            <Modal visible={cameraVisible} animationType="slide">
                                <View style={styles.cameraModal}>
                                    {hasCameraPermission === false ? (
                                        <View style={styles.cameraPermissionMessage}>
                                            <Text>{permissionMessage || "Camera permission denied. Please grant permission and try again."}</Text>
                                            <Button onPress={handleCloseCamera} style={styles.button}>Close</Button>
                                        </View>
                                    ) : (
                                        <View style={styles.cameraContainer}>
                                            <CameraView style={styles.cameraPreview} facing="back" ref={cameraRef} />
                                            <View style={styles.cameraControls}>
                                                <Button mode="contained" onPress={handleCapturePhoto} style={styles.captureButton}>
                                                    Capture
                                                </Button>
                                                <Button mode="outlined" onPress={handleCloseCamera} style={styles.cancelCaptureButton}>
                                                    Cancel
                                                </Button>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </Modal>
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
    deadlineText: {
        marginTop: 8,
        color: "#666",
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
    photoPreview: {
        width: "100%",
        height: 220,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: "#000",
    },
    cameraModal: {
        flex: 1,
        backgroundColor: "#000",
    },
    cameraContainer: {
        flex: 1,
    },
    cameraPreview: {
        flex: 1,
    },
    cameraControls: {
        position: "absolute",
        bottom: 24,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 16,
    },
    captureButton: {
        minWidth: 120,
        
    },
    cancelCaptureButton: {
        minWidth: 120,
        backgroundColor: "#000",
    },
    cameraPermissionMessage: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#FFF"
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
    locationDebug: {
        marginTop: 12,
        padding: 12,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: "#2196F3",
    },
    debugLabel: {
        fontWeight: "600",
        marginBottom: 4,
        color: "#2196F3",
    },
    debugText: {
        color: "#666",
        fontFamily: "monospace",
        marginBottom: 2,
    },
})