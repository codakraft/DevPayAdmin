import { PRODUCT_ID, ENVIRONMENT, API_BASE_URL } from "../config/environment";

/**
 * Custom hook to access environment configuration
 */
export const useEnvironment = () => {
  return {
    productId: PRODUCT_ID,
    apiBaseUrl: API_BASE_URL,
    environment: ENVIRONMENT,
    isProduction: ENVIRONMENT === "production",
    isDevelopment: ENVIRONMENT === "development",
    isTest: ENVIRONMENT === "test",
  };
};

/**
 * Get product ID directly
 */
export const getProductId = () => PRODUCT_ID;

/**
 * Get API base URL directly  
 */
export const getApiBaseUrl = () => API_BASE_URL;