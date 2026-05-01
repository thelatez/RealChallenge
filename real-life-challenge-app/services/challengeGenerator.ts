import type { Challenge, ChallengeTemplate } from "@/types/Challenge";

export function generateChallenge(recentChallenges: Challenge[]): Challenge {
    let available = filterRecentTemplates(recentChallenges, templates);

    if (available.length === 0) {
        available = templates;
    }

    const template = getRandomTemplate(available);

    const generatedData = template.generate();

    // Set deadline to end of today
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const deadline = today.getTime()

    return {
        id: crypto.randomUUID(),
        templateId: template.templateId,
        type: template.type,
        title: template.title,
        description: template.description,
        status: "ongoing",
        deadline,
        ...generatedData,
    };

}

const templates: ChallengeTemplate[] = [
    {
        templateId: "walk_distance",
        type: "movement",
        title: "Go for a walk",
        description: "Walk a certain distance",
        generate: () => {
            const distance = 300 + Math.floor(Math.random() * 700); // 300–1000m

            return {
                distanceMeters: distance,
                description: `Walk ${distance} meters`,
            };
        },
    },
    {
        templateId: "take_photo",
        type: "photo",
        title: "Take a photo",
        description: "Capture something interesting",
        generate: () => {
            const objects = ["tree", "car", "building"];

            const selected =
                objects[Math.floor(Math.random() * objects.length)];

            return {
                requiredObject: selected,
                description: `Take a photo of a ${selected}`,
            };
        },
    },
];

function filterRecentTemplates(recentChallenges: Challenge[], templates: ChallengeTemplate[]): ChallengeTemplate[] {
    const recentIds = recentChallenges
        .slice(-7)
        .map((c) => c.templateId);

    return templates.filter(
        (t) => !recentIds.includes(t.templateId)
    );
}

function getRandomTemplate(templates: ChallengeTemplate[]): ChallengeTemplate {
    const index = Math.floor(Math.random() * templates.length);
    return templates[index];
}