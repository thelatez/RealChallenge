import { ProgressBar as PaperProgressBar } from 'react-native-paper';
import { View } from 'react-native';

interface ProgressBarProps {
    progress: number; // 0-1
    label?: string;
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
    return (
        <View style={{ marginVertical: 8 }}>
            <PaperProgressBar progress={progress} />
        </View>
    );
}