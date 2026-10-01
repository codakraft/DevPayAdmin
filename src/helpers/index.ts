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
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  // Backend timestamps can carry 7 fractional digits (e.g. 2026-03-09T19:43:08.5413631),
  // which not every browser parses — trim to milliseconds first.
  const dateObj =
    typeof date === 'string'
      ? new Date(date.replace(/(\.\d{3})\d+/, '$1'))
      : date;
  if (isNaN(dateObj.getTime())) return '-';
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Utility function to make role names readable
 * @param role - Role name from the API (e.g. LoanOfficer, SUPER_ADMIN)
 * @returns Role name with spaces between words (e.g. Loan Officer)
 */
export const formatRoleName = (role: string | null | undefined): string => {
  if (!role) return '';
  return role
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Readable list of a user's roles
 * @param user - User with `roles` (all roles) and/or `role` (first role only)
 * @returns e.g. "Loan Officer, Auditor"
 */
export const formatUserRoles = (user: {
  role?: string | null;
  roles?: { name: string }[];
}): string => {
  const names = user.roles?.length
    ? user.roles.map((r) => r.name)
    : user.role
    ? [user.role]
    : [];
  return names.map(formatRoleName).join(', ');
};

/**
 * Validates admin password strength
 * @param password - Password to check
 * @returns Error message, or empty string when the password is valid
 */
export const getPasswordError = (password: string): string => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
  return '';
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
