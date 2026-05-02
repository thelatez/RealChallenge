import { useChallengeContext } from "@/context/ChallengeContext";
import { useRouter } from "expo-router";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { Card, Text, Button, Chip } from "react-native-paper";
import { useEffect, useState } from "react";
import DebugMenu from "@/components/DebugMenu";
import { generateChallenge } from "@/services/challengeGenerator";

export default function Index() {
  const { challenges, addChallenge, isLoading } = useChallengeContext()
  const router = useRouter()
  const [debugVisible, setDebugVisible] = useState(false)

  useEffect(() => {
    if (isLoading) return

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const hasTodayChallenge = challenges.some(c =>
      c.deadline >= todayStart.getTime() &&
      c.deadline <= todayEnd.getTime() &&
      (c.status === "ongoing" || c.status === "completed")
    )

    if (!hasTodayChallenge) {
      const newChallenge = generateChallenge(challenges)
      addChallenge(newChallenge)
    }
  }, [isLoading, challenges, addChallenge])

  // Get today's challenge (first ongoing challenge)
  const todayChallenge = challenges.find(c => c.status === "ongoing")

  // Calculate stats
  const stats = {
    completedToday: challenges.filter(c => c.status === "completed").length,
    completedTotal: challenges.filter(c => c.status === "completed").length,
    expiredToday: challenges.filter(c => c.status === "expired").length,
  }

  const handleStartChallenge = () => {
    if (todayChallenge) {
      router.push(`/challenges/${todayChallenge.id}`)
    }
  }

  const handleViewAll = () => {
    router.push("/challenges")
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {/* DEBUG BUTTON - temporary */}
        <View style={styles.debugButtonContainer}>
          <Pressable onPress={() => setDebugVisible(true)} style={styles.debugButton}>
            <Text style={styles.debugButtonText}>🧪 Debug</Text>
          </Pressable>
        </View>

        {/* TODAY'S CHALLENGE CARD */}
        {todayChallenge ? (
          <Card style={styles.todayCard}>
            <Card.Content>
              <View style={styles.todayHeader}>
                <Text variant="titleMedium">Today&apos;s Challenge</Text>
                <Chip style={styles.badge}>Active</Chip>
              </View>
              <Text variant="headlineSmall" style={styles.challengeTitle}>
                {todayChallenge.title}
              </Text>
              <Text variant="bodyMedium" style={styles.challengeDescription}>
                {todayChallenge.description}
              </Text>
              {todayChallenge.type === "movement" && todayChallenge.distanceMeters && (
                <View style={styles.challengeDetail}>
                  <Text variant="labelLarge">Distance: {todayChallenge.distanceMeters}m</Text>
                </View>
              )}
              {todayChallenge.type === "photo" && (
                <View style={styles.challengeDetail}>
                  <Text variant="labelLarge">Capture: {todayChallenge.requiredObject || "photo"}</Text>
                </View>
              )}
              <Button
                mode="contained"
                onPress={handleStartChallenge}
                style={styles.startButton}
              >
                Open Challenge
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.todayCard}>
            <Card.Content style={styles.emptyState}>
              <Text variant="bodyLarge">No challenges today!</Text>
              <Text variant="bodySmall" style={styles.emptyStateText}>
                You&apos;ve completed everything!
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* STATS */}
        <View style={styles.statsContainer}>
          <Text variant="titleMedium" style={styles.statsTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text variant="displaySmall" style={styles.statNumber}>
                {challenges.filter(c => c.status === "ongoing").length}
              </Text>
              <Text variant="labelMedium">Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="displaySmall" style={styles.statNumber}>
                {stats.completedTotal}
              </Text>
              <Text variant="labelMedium">Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="displaySmall" style={styles.statNumber}>
                {stats.expiredToday}
              </Text>
              <Text variant="labelMedium">Expired</Text>
            </View>
          </View>
        </View>

        {/* ALL CHALLENGES BUTTON */}
        <Button
          mode="outlined"
          onPress={handleViewAll}
          style={styles.viewAllButton}
        >
          View All Challenges
        </Button>
      </ScrollView>

      {/* DEBUG MENU */}
      <DebugMenu visible={debugVisible} onClose={() => setDebugVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  debugButtonContainer: {
    marginBottom: 24,
    alignItems: "flex-end",
  },
  debugButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  debugButtonText: {
    fontSize: 14,
    color: "#1a1a1a",
  },
  todayCard: {
    marginBottom: 32,
  },
  todayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badge: {
    backgroundColor: "#FF9800",
  },
  challengeTitle: {
    marginVertical: 12,
    color: "#2196F3",
  },
  challengeDescription: {
    color: "#666",
    marginBottom: 12,
  },
  challengeDetail: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  startButton: {
    marginTop: 16,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyStateText: {
    marginTop: 8,
    color: "#999",
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  statNumber: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  viewAllButton: {
    marginBottom: 32,
  },
});
