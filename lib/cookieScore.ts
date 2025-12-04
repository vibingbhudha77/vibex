/**
 * Cookie Score 2.0 - ELO Rating System
 * LeetCode-inspired rating algorithm for measuring helpfulness and expertise.
 */

/**
 * Calculate K-factor based on user's session count.
 * New users (< 10 sessions): K = 40 (high volatility)
 * Established users (10-50 sessions): K = 20
 * Veterans (> 50 sessions): K = 10 (low volatility)
 */
export function calculateKFactor(sessionCount: number): number {
    if (sessionCount < 10) return 40;
    if (sessionCount < 50) return 20;
    return 10;
}

/**
 * Calculate expected performance based on current rating.
 * Uses ELO formula: E = 1 / (1 + 10^((1500 - R) / 400))
 * 1500 is the baseline rating.
 */
export function calculateExpected(rating: number): number {
    return 1 / (1 + Math.pow(10, (1500 - rating) / 400));
}

/**
 * Calculate new rating after a Cookie session.
 * Formula: new_rating = old_rating + K * (actual - expected)
 * 
 * @param oldRating - Current Cookie Score
 * @param sessionCount - Total number of sessions participated in
 * @param vouchesReceived - Number of vouches received in this session
 * @param totalParticipants - Total participants in the session (including creator)
 * @returns New rating (rounded to nearest integer)
 */
export function calculateNewRating(
    oldRating: number,
    sessionCount: number,
    vouchesReceived: number,
    totalParticipants: number
): number {
    const K = calculateKFactor(sessionCount);
    const expected = calculateExpected(oldRating);
    const actual = totalParticipants > 1 ? vouchesReceived / (totalParticipants - 1) : 0;

    return Math.round(oldRating + K * (actual - expected));
}

/**
 * Get rating tier information based on Cookie Score.
 * Tiers: Newbie, Contributor, Specialist, Expert, Master, Grandmaster
 */
export function getRatingTier(rating: number): {
    name: string;
    color: string;
    bgColor: string;
    minRating: number;
} {
    if (rating >= 2200) {
        return {
            name: 'Grandmaster',
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            minRating: 2200
        };
    }
    if (rating >= 1900) {
        return {
            name: 'Master',
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            minRating: 1900
        };
    }
    if (rating >= 1600) {
        return {
            name: 'Expert',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            minRating: 1600
        };
    }
    if (rating >= 1400) {
        return {
            name: 'Specialist',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-100',
            minRating: 1400
        };
    }
    if (rating >= 1200) {
        return {
            name: 'Contributor',
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            minRating: 1200
        };
    }
    return {
        name: 'Newbie',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        minRating: 0
    };
}

/**
 * Calculate points awarded for a vouch based on diminishing returns.
 * 1st vouch: 10 points
 * 2nd vouch: 8 points
 * 3rd vouch: 6 points
 * 4th vouch: 4 points
 * 5th vouch: 2 points
 * 6th+ vouch: 0 points
 */
export function calculateVouchPoints(vouchCount: number): number {
    return Math.max(0, 10 - (vouchCount * 2));
}

/**
 * Get all tier thresholds for displaying progression.
 */
export function getAllTiers() {
    return [
        { name: 'Newbie', minRating: 0, color: 'text-gray-500', bgColor: 'bg-gray-100' },
        { name: 'Contributor', minRating: 1200, color: 'text-green-600', bgColor: 'bg-green-100' },
        { name: 'Specialist', minRating: 1400, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
        { name: 'Expert', minRating: 1600, color: 'text-blue-600', bgColor: 'bg-blue-100' },
        { name: 'Master', minRating: 1900, color: 'text-purple-600', bgColor: 'bg-purple-100' },
        { name: 'Grandmaster', minRating: 2200, color: 'text-red-600', bgColor: 'bg-red-100' },
    ];
}

/**
 * Calculate progress to next tier as a percentage.
 */
export function getProgressToNextTier(rating: number): number {
    const currentTier = getRatingTier(rating);
    const allTiers = getAllTiers();
    const currentIndex = allTiers.findIndex(t => t.name === currentTier.name);

    if (currentIndex === allTiers.length - 1) {
        return 100; // Already at max tier
    }

    const nextTier = allTiers[currentIndex + 1];
    const rangeSize = nextTier.minRating - currentTier.minRating;
    const progress = rating - currentTier.minRating;

    return Math.min(100, Math.round((progress / rangeSize) * 100));
}
