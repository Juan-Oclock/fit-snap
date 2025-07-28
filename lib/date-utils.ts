/**
 * Date utility functions for FitSnap app
 */

/**
 * Get the number of remaining days in the current month (including today)
 * @returns Number of days remaining in the current month
 */
export const getRemainingDaysInMonth = (): number => {
  const now = new Date();
  const currentDay = now.getDate();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  // Return remaining days including today
  return lastDayOfMonth - currentDay + 1;
};

/**
 * Get the total number of days in the current month
 * @returns Total number of days in the current month
 */
export const getDaysInCurrentMonth = (): number => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};

/**
 * Get the current month name
 * @returns Current month name (e.g., "July")
 */
export const getCurrentMonthName = (): string => {
  const now = new Date();
  return now.toLocaleString('default', { month: 'long' });
};

/**
 * Get the current date in a readable format
 * @returns Current date (e.g., "July 28")
 */
export const getCurrentDateString = (): string => {
  const now = new Date();
  return now.toLocaleString('default', { month: 'long', day: 'numeric' });
};

/**
 * Check if we're in the last week of the month
 * @returns True if there are 7 or fewer days remaining
 */
export const isLastWeekOfMonth = (): boolean => {
  return getRemainingDaysInMonth() <= 7;
};

/**
 * Get a descriptive message about remaining days
 * @returns Descriptive message for UI
 */
export const getRemainingDaysMessage = (): string => {
  const remaining = getRemainingDaysInMonth();
  const monthName = getCurrentMonthName();
  
  if (remaining === 1) {
    return `Last day of ${monthName}`;
  } else if (remaining <= 3) {
    return `Only ${remaining} days left in ${monthName}`;
  } else if (remaining <= 7) {
    return `${remaining} days remaining in ${monthName}`;
  } else {
    return `${remaining} days left in ${monthName}`;
  }
};
