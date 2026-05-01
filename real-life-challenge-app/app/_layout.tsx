import { Stack } from "expo-router";
import { ChallengeProvider } from "@/context/ChallengeContext";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#2196F3",
    secondary: "#FF9800",
    tertiary: "#4CAF50",
    background: "#f5f5f5",
    surface: "#ffffff",
    onBackground: "#1a1a1a",
    onSurface: "#1a1a1a",
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <ChallengeProvider>
        <Stack
          screenOptions={{
            headerTintColor: "#1a1a1a",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
            headerTitleStyle: {
              color: "#1a1a1a",
              fontWeight: "600",
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "RealChallenge",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="challenges/index"
            options={{
              title: "All Challenges",
            }}
          />
          <Stack.Screen
            name="challenges/[id]"
            options={{
              title: "Challenge",
            }}
          />
        </Stack>
      </ChallengeProvider>
    </PaperProvider>
  );
}
