import { View, ScrollView, StyleSheet, Modal, Pressable } from "react-native";
import { Button, Text, Dialog, Portal, Divider, Card } from "react-native-paper";
import { useState } from "react";
import { generateChallenge } from "@/services/challengeGenerator";
import { useChallengeContext } from "@/context/ChallengeContext";
import { clearChallenges } from "@/services/storageService";

interface DebugMenuProps {
    visible: boolean;
    onClose: () => void;
}

export default function DebugMenu({ visible, onClose }: DebugMenuProps) {
    const { challenges, addChallenge, completeChallenge, removeChallenge } = useChallengeContext();
    const [clearConfirm, setClearConfirm] = useState(false);

    const handleGenerateChallenge = () => {
        const newChallenge = generateChallenge(challenges);
        addChallenge(newChallenge);
    };

    const handleCompleteRandom = () => {
        const ongoing = challenges.find(c => c.status === "ongoing");
        if (ongoing) {
            completeChallenge(ongoing.id);
        }
    };

    const handleExpireRandom = () => {
        const ongoing = challenges.find(c => c.status === "ongoing");
        if (ongoing) {
            removeChallenge(ongoing.id);
            const expired = { ...ongoing, status: "expired" as const };
            addChallenge(expired);
        }
    };

    const handleClearStorage = async () => {
        await clearChallenges();
        // Clear all challenges by removing them
        challenges.forEach(c => removeChallenge(c.id));
        setClearConfirm(false);
    };

    const handleSimulateWrongValidation = () => {
        const ongoing = challenges.find(c => c.status === "ongoing");
        if (ongoing) {
            // Just log it - the actual validation will show in the detail screen
            console.log("Simulating wrong validation for:", ongoing.title);
        }
    };

    const handleSimulateExpiredDeadline = () => {
        const ongoing = challenges.find(c => c.status === "ongoing");
        if (ongoing) {
            removeChallenge(ongoing.id);
            const expiredChallenge = {
                ...ongoing,
                deadline: Date.now() - 1000, // Past deadline
                status: "expired" as const
            };
            addChallenge(expiredChallenge);
        }
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={onClose}
            >
                <View style={styles.overlay}>
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Text variant="headlineSmall">🧪 Debug Menu</Text>
                            <Text variant="bodySmall" style={styles.subtitle}>
                                Temporary testing tools
                            </Text>
                        </View>

                        <ScrollView style={styles.content}>
                            {/* CHALLENGE GENERATION */}
                            <Card style={styles.section}>
                                <Card.Content>
                                    <Text variant="labelLarge" style={styles.sectionTitle}>
                                        Challenge Generation
                                    </Text>
                                    <Button
                                        mode="contained"
                                        onPress={handleGenerateChallenge}
                                        style={styles.button}
                                    >
                                        ➕ Generate Random Challenge
                                    </Button>
                                </Card.Content>
                            </Card>

                            {/* VALIDATION TESTING */}
                            <Card style={styles.section}>
                                <Card.Content>
                                    <Text variant="labelLarge" style={styles.sectionTitle}>
                                        Validation Testing
                                    </Text>
                                    <View style={styles.buttonColumn}>
                                        <Button
                                            mode="contained"
                                            onPress={handleCompleteRandom}
                                            disabled={!challenges.some(c => c.status === "ongoing")}
                                            style={styles.button}
                                        >
                                            ✅ Complete Active Challenge
                                        </Button>
                                        <Button
                                            mode="contained-tonal"
                                            onPress={handleSimulateWrongValidation}
                                            disabled={!challenges.some(c => c.status === "ongoing")}
                                            style={styles.button}
                                        >
                                            ❌ Simulate Wrong Validation
                                        </Button>
                                    </View>
                                </Card.Content>
                            </Card>

                            {/* DEADLINE TESTING */}
                            <Card style={styles.section}>
                                <Card.Content>
                                    <Text variant="labelLarge" style={styles.sectionTitle}>
                                        Deadline Testing
                                    </Text>
                                    <Button
                                        mode="contained"
                                        onPress={handleSimulateExpiredDeadline}
                                        disabled={!challenges.some(c => c.status === "ongoing")}
                                        style={styles.button}
                                    >
                                        ⏰ Mark Active as Expired
                                    </Button>
                                </Card.Content>
                            </Card>

                            {/* STATS */}
                            <Card style={styles.section}>
                                <Card.Content>
                                    <Text variant="labelLarge" style={styles.sectionTitle}>
                                        Current Stats
                                    </Text>
                                    <View style={styles.stats}>
                                        <Text variant="bodySmall">
                                            Total: {challenges.length}
                                        </Text>
                                        <Text variant="bodySmall">
                                            Active: {challenges.filter(c => c.status === "ongoing").length}
                                        </Text>
                                        <Text variant="bodySmall">
                                            Completed: {challenges.filter(c => c.status === "completed").length}
                                        </Text>
                                        <Text variant="bodySmall">
                                            Expired: {challenges.filter(c => c.status === "expired").length}
                                        </Text>
                                    </View>
                                </Card.Content>
                            </Card>

                            {/* DESTRUCTIVE ACTIONS */}
                            <Card style={[styles.section, styles.dangerSection]}>
                                <Card.Content>
                                    <Text variant="labelLarge" style={[styles.sectionTitle, { color: "#F44336" }]}>
                                        Danger Zone
                                    </Text>
                                    <Button
                                        mode="contained"
                                        buttonColor="#F44336"
                                        onPress={() => setClearConfirm(true)}
                                        style={styles.button}
                                    >
                                        🗑️ Clear All Storage
                                    </Button>
                                </Card.Content>
                            </Card>
                        </ScrollView>

                        <View style={styles.footer}>
                            <Button
                                mode="outlined"
                                onPress={onClose}
                                style={{ flex: 1 }}
                            >
                                Close
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* CLEAR CONFIRMATION DIALOG */}
            <Dialog visible={clearConfirm} onDismiss={() => setClearConfirm(false)}>
                <Dialog.Title>Clear all challenges?</Dialog.Title>
                <Dialog.Content>
                    <Text variant="bodyMedium">
                        This will delete all challenges from storage. This action cannot be undone.
                    </Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => setClearConfirm(false)}>Cancel</Button>
                    <Button
                        onPress={handleClearStorage}
                        textColor="#F44336"
                    >
                        Delete All
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: "90%",
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    header: {
        marginBottom: 16,
    },
    subtitle: {
        marginTop: 4,
        color: "#999",
    },
    content: {
        marginBottom: 16,
        maxHeight: "100%",
    },
    section: {
        marginBottom: 12,
    },
    dangerSection: {
        borderColor: "#F44336",
        borderWidth: 1,
    },
    sectionTitle: {
        marginBottom: 12,
        fontWeight: "600",
    },
    button: {
        marginVertical: 4,
    },
    buttonColumn: {
        gap: 8,
    },
    stats: {
        gap: 4,
        padding: 12,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        paddingTop: 12,
    },
});
