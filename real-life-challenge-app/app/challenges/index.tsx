import { useChallengeContext } from "@/context/ChallengeContext";
import { FlatList, View } from "react-native";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import ChallengeCard from "@/components/ChallengeCard";
import { SegmentedButtons, Text } from "react-native-paper";
import { useState } from "react";

export default function ChallengesIndex() {
    const { challenges } = useChallengeContext()
    const router = useRouter()
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

    const filteredChallenges = challenges.filter(c => {
        if (filter === "all") return true
        if (filter === "active") return c.status === "ongoing"
        if (filter === "completed") return c.status === "completed"
        return true
    })

    const handleChallengePress = (id: string) => {
        router.push(`/challenges/${id}`)
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineMedium">Challenges</Text>
                <View style={{ marginTop: 12 }}>
                    <SegmentedButtons
                        value={filter}
                        onValueChange={(value: any) => setFilter(value)}
                        buttons={[
                            { value: "all", label: "All" },
                            { value: "active", label: "Active" },
                            { value: "completed", label: "Done" },
                        ]}
                    />
                </View>
            </View>

            {filteredChallenges.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text variant="bodyMedium">No challenges</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredChallenges}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => handleChallengePress(item.id)}>
                            <ChallengeCard challenge={item} />
                        </Pressable>
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    header: {
        marginBottom: 16,
    },
    list: {
        paddingBottom: 20,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})