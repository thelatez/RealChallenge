import * as Location from "expo-location"
import { useState } from "react";

export type LocationResult =
    | { success: true; location: Location.LocationObject }
    | { success: false; message: string };

export function useLocation() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null)

    async function getCurrentLocation(): Promise<LocationResult> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                return {
                    success: false,
                    message: 'Location permission denied. Please allow location access in settings.',
                };
            }

            const loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            return {
                success: true,
                location: loc,
            };
        } catch (error) {
            console.error('Error getting location:', error);
            return {
                success: false,
                message: 'Unable to get current location. Please try again.',
            };
        }
    }

    return { location, getCurrentLocation };
}
