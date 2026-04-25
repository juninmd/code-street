export const getLevelData = () => {
    const xp = parseInt(localStorage.getItem('user_xp') || '0', 10);
    // Simple leveling formula: Level = floor(sqrt(XP / 100)) + 1
    // Lvl 1: 0 XP
    // Lvl 2: 100 XP
    // Lvl 3: 400 XP
    // Lvl 4: 900 XP
    // Lvl 5: 1600 XP
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;

    // Calculate XP needed for NEXT level
    const nextLevel = level + 1;
    const nextLevelXp = Math.pow(nextLevel - 1, 2) * 100;

    // Calculate XP of CURRENT level start
    const currentLevelXp = Math.pow(level - 1, 2) * 100;

    const progress = xp - currentLevelXp;
    const progressNeeded = nextLevelXp - currentLevelXp;
    const progressPercent = Math.min(100, Math.max(0, (progress / progressNeeded) * 100));

    return {
        xp,
        level,
        nextLevelXp,
        progressPercent,
        currentLevelXp
    };
};

export const addXP = (amount) => {
    const { level: oldLevel, xp: oldXp } = getLevelData();
    const newXp = oldXp + amount;

    localStorage.setItem('user_xp', newXp.toString());

    const { level: newLevel } = getLevelData();

    return {
        leveledUp: newLevel > oldLevel,
        newLevel,
        newXp
    };
};
