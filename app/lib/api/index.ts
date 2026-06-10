import Constants from 'expo-constants';

export * from './auth';
export * from './sync';

const getEnvVars = () => {
  const extra = Constants.expoConfig?.extra || {};
  return {
    environment: extra.ENVIRONMENT || process.env.ENVIRONMENT || 'development',
  };
};

const env = getEnvVars();

export const environment = {
  isDevelopment: env.environment === 'development',
  name: env.environment,
};
