# RealChallenge
A "real-life challenge" mobile app created with Expo and React Native.

The application provides users daily "real-life" challenges, that are completed in a real environment. Challenges can be about moving, observing surroundings or simple tasks (e.g. moving a certain distance, taking a picture of a specific thing or color, or visiting a new place).

User can:
- Receive and look through challenges
- Complete challenges using device features (location, camera)
- Get automatic checking for challenge progress (e.g. from location)
- Save completed challenges and follow progress

The application includes many views (e.g. challenges, active challenge, history) and uses different components and logic in challenge generation and validation.

Used technologies:
- React Native + Expo
- Expo Router (navigation between views)
- TypeScript

Expo SDK -features:
- expo-location (location based challenges)
- expo-camera (camera based challenges)
- expo-notifications (daily challenges / reminders)

Data management:
- AsyncStorage (local storage for challenges and progress)

UI:
- react-native-paper (UI components)

Program architecture:
- Custom React hookit (e.g. challenge management and logic)
- Context API (global state management, e.g. challenge progress)
