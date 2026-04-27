import * as Location from "expo-location"
import { useState } from "react";

export function useLocation() {
    const[location, setLocation] = useState<Location.LocationObject | null>(null)

    async function getCurrentLocation() {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc)
    }

    return {location, getCurrentLocation}
}