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
/**
 * Parses an API timestamp. The API sends UTC times without an offset
 * (e.g. 2026-03-09T19:43:08.5413631), which browsers would read as local time
 * (an hour behind in Lagos), so treat offset-less times as UTC. Also trims the
 * 7 fractional digits, which not every browser parses.
 */
export const parseApiDate = (value: string | Date): Date => {
  if (value instanceof Date) return value;
  let text = value.trim().replace(/(\.\d{3})\d+/, '$1');
  const hasTime = /T\d{2}:\d{2}/.test(text);
  const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/i.test(text);
  if (hasTime && !hasOffset) text += 'Z';
  return new Date(text);
};

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  const dateObj = parseApiDate(date);
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

/**
 * Formats an API timestamp as date and time in the viewer's time zone
 * @returns e.g. "Mar 9, 2026, 8:43 PM", or "-" when missing/invalid
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  const dateObj = parseApiDate(date);
  if (isNaN(dateObj.getTime())) return '-';
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};
