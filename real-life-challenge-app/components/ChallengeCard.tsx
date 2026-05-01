import { Challenge } from '@/types/Challenge';
import { Card, Text, Chip } from 'react-native-paper';
import { View } from 'react-native';

interface ChallengeCardProps {
    challenge: Challenge;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
    const getStatusColor = () => {
        switch (challenge.status) {
            case 'completed':
                return '#4CAF50';
            case 'expired':
                return '#F44336';
            case 'ongoing':
                return '#2196F3';
        }
    };

    const getStatusLabel = () => {
        switch (challenge.status) {
            case 'completed':
                return 'Completed';
            case 'expired':
                return 'Expired';
            case 'ongoing':
                return 'Active';
        }
    };

    return (
        <Card style={{ marginVertical: 8 }}>
            <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium">{challenge.title}</Text>
                        <Text variant="bodySmall" style={{ color: '#666', marginTop: 4 }}>
                            {challenge.description}
                        </Text>
                    </View>
                    <Chip 
                        style={{ backgroundColor: getStatusColor() }}
                        textStyle={{ color: '#fff' }}
                    >
                        {getStatusLabel()}
                    </Chip>
                </View>
                <View style={{ marginTop: 8 }}>
                    <Text variant="labelSmall">{challenge.type.toUpperCase()}</Text>
                </View>
            </Card.Content>
        </Card>
    );
}