/**
 * Utility function to parse query parameters into URL search string
 * @param params - Object containing query parameters
 * @returns URL search string
 */
export const parseQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

/**
 * Utility function to format currency values
 * @param amount - Number to format
 * @param currency - Currency symbol (default: ₦)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = '₦'): string => {
  return `${currency}${amount.toLocaleString()}`;
};

/**
 * Utility function to format date strings
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Utility function to truncate text
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
