export const getDoodleAvatarUrl = (seed: string) => {
    // Using 'open-peeps' style for a hand-drawn doodle look
    // Other good options: 'adventurer', 'notionists', 'micah'
    return `https://api.dicebear.com/9.x/open-peeps/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
};
