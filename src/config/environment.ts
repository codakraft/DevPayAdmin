// Environment configuration for DevPayAdmin
const environment = {
  development: {
    apiBaseUrl: "https://staginlending-fvexbmfhawe7e6ad.southafricanorth-01.azurewebsites.net/api/v1/",
    productId: "372e9a1d-c714-4fc2-b44a-3eeb8ebda4c1",
  },
  test: {
    apiBaseUrl: "https://staginlending-fvexbmfhawe7e6ad.southafricanorth-01.azurewebsites.net/api/v1/",
    productId: "372e9a1d-c714-4fc2-b44a-3eeb8ebda4c1",
  },
  production: {
    apiBaseUrl: "https://devpayprod-cvd7axbkemare5dn.southafricanorth-01.azurewebsites.net/api/v1/",
    productId: "00487268-6698-4fe4-bda2-39fc32c60a1d",
  },
};

// Get current environment
const getCurrentEnvironment = (): keyof typeof environment => {
  // Check for custom environment variable first (highest priority)
  const customEnv = process.env.REACT_APP_ENV as keyof typeof environment;
  if (customEnv && environment[customEnv]) {
    return customEnv;
  }
  
  // Check NODE_ENV as fallback
  if (process.env.NODE_ENV === "development") {
    return "development";
  }
  
  // Check if running in test mode
  if (process.env.NODE_ENV === "test") {
    return "test";
  }
  
  // Default to development
  return "development";
};

// Export current environment configuration
const currentEnv = getCurrentEnvironment();
export const config = {
  ...environment[currentEnv],
  environment: currentEnv,
};

// Export individual configs for easy access
export const API_BASE_URL = config.apiBaseUrl;
export const PRODUCT_ID = config.productId;
export const ENVIRONMENT = config.environment;

// Console log for debugging (remove in production)
if (process.env.NODE_ENV === "development") {
  console.log(`🌍 DevPayAdmin Environment: ${ENVIRONMENT}`);
  console.log(`🔗 API Base URL: ${API_BASE_URL}`);
  console.log(`📦 Product ID: ${PRODUCT_ID}`);
}