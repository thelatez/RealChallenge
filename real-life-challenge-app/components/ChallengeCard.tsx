import { Challenge } from '@/types/Challenge';
import { Card, Text } from 'react-native-paper';

export default function ChallengeCard(challenge: Challenge) {
    return (
        <Card>
            <Text>{challenge.title}</Text>
        </Card>
    );
}