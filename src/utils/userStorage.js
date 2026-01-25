/**
 * User-scoped localStorage utilities
 * 
 * All user progress and emotion data is automatically scoped to the logged-in user's email.
 * When a different user logs in, they automatically get fresh data for that email.
 * Previously stored data for other users is preserved.
 */

/**
 * Get the email-scoped localStorage key
 * @param {string} baseKey - The base key name (e.g., "moduleProgress", "emotionHistory")
 * @returns {string} The email-scoped key or base key if no user is logged in
 */
export const getStorageKey = (baseKey) => {
    const userEmail = localStorage.getItem("userEmail");
    return userEmail ? `${baseKey}_${userEmail}` : baseKey;
};

/**
 * Get user progress from localStorage
 * @param {string} keyName - Base key name
 * @returns {object} Parsed data or empty object if not found
 */
export const getUserData = (keyName) => {
    const key = getStorageKey(keyName);
    return JSON.parse(localStorage.getItem(key)) || {};
};

/**
 * Save user progress to localStorage
 * @param {string} keyName - Base key name
 * @param {object} data - Data to save
 */
export const saveUserData = (keyName, data) => {
    const key = getStorageKey(keyName);
    localStorage.setItem(key, JSON.stringify(data));
};

/**
 * Clear all user data for current logged-in user
 * (Not used in current implementation - data resets implicitly when email changes)
 */
export const clearUserData = () => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    const keysToRemove = [
        `moduleProgress_${userEmail}`,
        `emotionHistory_${userEmail}`,
        `moduleEmotionHistory_${userEmail}`,
        `moduleEmotionSummary_${userEmail}`
    ];

    keysToRemove.forEach((k) => localStorage.removeItem(k));
};

/**
 * Email-scoped localStorage key patterns:
 * 
 * - moduleProgress_<email>: { week: "completed" }
 * - emotionHistory_<email>: { "Happy": 5, "Sad": 3, ... }
 * - moduleEmotionHistory_<email>: { weekId: { "Happy": 2, "Sad": 1 } }
 * - moduleEmotionSummary_<email>: { weekId: "DominantEmotion" }
 * 
 * When user logs in:
 * 1. Previous email is checked
 * 2. New email is set in localStorage
 * 3. If email differs, userSessionChanged flag is set
 * 4. On page load, each component reads from email-scoped key
 * 5. First access to new email's key returns empty object (fresh data)
 * 6. Previous user's data remains in localStorage under their email key
 */