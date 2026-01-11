export const getLocalDateKey = (date: Date = new Date()): string => {
    // Use manual formatting to ensure YYYY-MM-DD in local time consistently across Android/iOS
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Check if two dates are the same day (in local time)
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
    return getLocalDateKey(date1) === getLocalDateKey(date2);
};
