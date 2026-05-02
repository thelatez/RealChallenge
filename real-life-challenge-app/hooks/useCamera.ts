import { useRef, useState } from "react";
import { Camera } from "expo-camera";

export function useCamera() {
    const cameraRef = useRef<any>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [permissionMessage, setPermissionMessage] = useState<string>("");

    async function requestCameraPermission() {
        const { status } = await Camera.requestCameraPermissionsAsync();
        const granted = status === "granted";
        setHasCameraPermission(granted);
        setPermissionMessage(
            granted
                ? ""
                : "Camera permission denied. Please allow camera access in your device settings."
        );
        return { granted, status };
    }

    async function takePictureAsync() {
        if (!cameraRef.current) {
            throw new Error("Camera is not ready.");
        }
        return await cameraRef.current.takePictureAsync({
            quality: 0.6,
            base64: true,
        });
    }

    return {
        cameraRef,
        hasCameraPermission,
        permissionMessage,
        requestCameraPermission,
        takePictureAsync,
    };
}
