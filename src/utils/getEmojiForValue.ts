export function getEmojiForValue(value: number, thresholds: {
    max: number;
    emoji: string;
}[]): string {
    for (const { max, emoji } of thresholds) {
        if (value <= max) {
            return emoji;
        }
    }
    return thresholds[thresholds.length - 1]?.emoji ?? "";
}