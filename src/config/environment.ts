// Environment configuration for DevPayAdmin
//
// Values come from environment variables (see .env, .env.development,
// .env.staging, .env.production). The maps below are only fallbacks for when a
// variable is missing at build time.
const environment = {
  development: {
    apiBaseUrl: "https://staginlending-fvexbmfhawe7e6ad.southafricanorth-01.azurewebsites.net/api/v1/",
    productId: "372e9a1d-c714-4fc2-b44a-3eeb8ebda4c1",
  },
  test: {
    apiBaseUrl: "https://staginlending-fvexbmfhawe7e6ad.southafricanorth-01.azurewebsites.net/api/v1/",
    productId: "372e9a1d-c714-4fc2-b44a-3eeb8ebda4c1",
  },
  staging: {
    apiBaseUrl: "https://staginlending-fvexbmfhawe7e6ad.southafricanorth-01.azurewebsites.net/api/v1/",
    productId: "372e9a1d-c714-4fc2-b44a-3eeb8ebda4c1",
  },
  production: {
    apiBaseUrl: "https://devpayprod-cvd7axbkemare5dn.southafricanorth-01.azurewebsites.net/api/v1/",
    productId: "00487268-6698-4fe4-bda2-39fc32c60a1d",
  },
};

type EnvironmentName = keyof typeof environment;

// Get current environment
const getCurrentEnvironment = (): EnvironmentName => {
  const name = process.env.REACT_APP_ENV as EnvironmentName | undefined;
  return name && name in environment ? name : "staging";
};

// Export current environment configuration
const currentEnv = getCurrentEnvironment();
export const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || environment[currentEnv].apiBaseUrl,
  productId: process.env.REACT_APP_PRODUCT_ID || environment[currentEnv].productId,
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
