import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from "class-validator";
import { AppEnvironment, LogLevel, NodeEnvironment } from "./app-config";

class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  @IsOptional()
  readonly NODE_ENV?: NodeEnvironment;

  @IsEnum(AppEnvironment)
  @IsOptional()
  readonly APP_ENV?: AppEnvironment;

  @IsEnum(LogLevel)
  @IsOptional()
  readonly LOG_LEVEL?: LogLevel;

  @IsNumber()
  @IsOptional()
  readonly DEVICE_BUSY_TIMEOUT?: number;

  @IsNumber()
  @IsOptional()
  readonly PORT?: number;

  @IsString()
  readonly MONGO_CONN: string;

  @IsString()
  readonly BROKER_SERVERS: string;

  @IsString()
  readonly BROKER_QUEUE: string;

  @IsString()
  @IsOptional()
  readonly BROKER_AUTH_TOKEN?: string;

  @IsString()
  readonly BROKER_USER_JWT: string;

  @IsString()
  readonly BROKER_USER_SEED: string;

  @IsString()
  readonly REDIS_URL: string;

  @IsString()
  readonly REDIS_PREFIX: string;

  @IsString()
  readonly OTEL_URL: string;

  @IsString()
  readonly OTEL_SERVICE_NAME: string;
}

export function appConfigValidation(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
