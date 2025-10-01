export enum NodeEnvironment {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
  TEST = "test",
}

export enum AppEnvironment {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
  STAGING = "staging",
  TEST = "test",
}

export enum LogLevel {
  FATAL = "fatal",
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
  TRACE = "trace",
}

export interface AppConfig {
  nodeEnv: NodeEnvironment;
  appEnv: AppEnvironment;
  logLevel: LogLevel;
  port: number;
  deviceBusyTimeout: number;
  otelServiceName: string;
  otelUrl: string;
  db: {
    uri: string;
  };
  redis: {
    url: string;
    prefix: string;
  };
  broker: {
    servers: string[];
    queue: string;
    authToken?: string;
    userJwt: string;
    userSeed: string;
  };
}

export const appConfig = (): AppConfig => ({
  nodeEnv:
    (process.env.NODE_ENV as NodeEnvironment) || NodeEnvironment.DEVELOPMENT,
  appEnv: (process.env.APP_ENV as AppEnvironment) || AppEnvironment.DEVELOPMENT,
  logLevel: (process.env.LOG_LEVEL as LogLevel) || LogLevel.DEBUG,
  port: parseInt(process.env.PORT || "4000", 10),
  deviceBusyTimeout: parseInt(process.env.DEVICE_BUSY_TIMEOUT || "3000", 10),
  otelServiceName: process.env.OTEL_SERVICE_NAME as string,
  otelUrl: process.env.OTEL_URL as string,
  db: {
    uri: process.env.MONGO_CONN as string,
  },
  redis: {
    url: process.env.REDIS_URL as string,
    prefix: process.env.REDIS_PREFIX as string,
  },
  broker: {
    servers: (process.env.BROKER_SERVERS as string).split(","),
    queue: process.env.BROKER_QUEUE as string,
    authToken: process.env.BROKER_AUTH_TOKEN as string,
    userJwt: process.env.BROKER_USER_JWT as string,
    userSeed: process.env.BROKER_USER_SEED as string,
  },
});
