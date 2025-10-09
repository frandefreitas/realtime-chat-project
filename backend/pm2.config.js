module.exports = {
  apps: [
    {
      name: 'realtime-chat-backend',
      cwd: './',
      script: 'dist/main.js',
      exec_mode: 'cluster',
      instances: 'max',
      watch: false,
      max_memory_restart: '1G',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,
      node_args: ['-r', './dist/instrumentation.js'],
      env: {
        NODE_ENV: 'development',
        APP_ENV: 'development',
        PORT: 4000,
        MONGODB_URI: 'mongodb://admin:admin@127.0.0.1:27017/chat-db?authSource=admin',
        NATS_URL: 'nats://127.0.0.1:4222',
        BROKER_AUTH_MODE: 'none',
        BROKER_USE_NKEYS: 'false',
        BROKER_USE_JWT: 'false',
        JWT_SECRET: 'dev-secret',
        JWT_EXPIRES_IN: '7d',
        OTEL_ENABLED: 'true',
        OTEL_SERVICE_NAME: 'realtime-chat-backend',
        OTEL_EXPORTER_OTLP_ENDPOINT: 'http://127.0.0.1:4318',
        OTEL_EXPORTER_OTLP_PROTOCOL: 'http/protobuf'
      },
      env_staging: {
        NODE_ENV: 'staging',
        APP_ENV: 'staging',
        PORT: 4010,
        MONGODB_URI: 'mongodb://admin:admin@127.0.0.1:27017/chat-db?authSource=admin',
        NATS_URL: 'nats://127.0.0.1:4222',
        BROKER_AUTH_MODE: 'none',
        BROKER_USE_NKEYS: 'false',
        BROKER_USE_JWT: 'false',
        JWT_SECRET: 'staging-secret',
        JWT_EXPIRES_IN: '7d',
        OTEL_ENABLED: 'true',
        OTEL_SERVICE_NAME: 'realtime-chat-backend',
        OTEL_EXPORTER_OTLP_ENDPOINT: 'http://127.0.0.1:4318',
        OTEL_EXPORTER_OTLP_PROTOCOL: 'http/protobuf'
      },
      env_production: {
        NODE_ENV: 'production',
        APP_ENV: 'production',
        PORT: 3011,
        MONGODB_URI: 'mongodb://admin:admin@127.0.0.1:27017/chat-db?authSource=admin',
        NATS_URL: 'nats://127.0.0.1:4222',
        BROKER_AUTH_MODE: 'none',
        BROKER_USE_NKEYS: 'false',
        BROKER_USE_JWT: 'false',
        JWT_SECRET: 'prod-secret',
        JWT_EXPIRES_IN: '7d',
        OTEL_ENABLED: 'true',
        OTEL_SERVICE_NAME: 'realtime-chat-backend',
        OTEL_EXPORTER_OTLP_ENDPOINT: 'http://127.0.0.1:4318',
        OTEL_EXPORTER_OTLP_PROTOCOL: 'http/protobuf'
      }
    }
  ]
}
