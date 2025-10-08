import 'dotenv/config';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

// @ts-ignore
const { Resource } = require('@opentelemetry/resources');

function parseHeaders(src?: string): Record<string, string> | undefined {
  if (!src) return undefined;
  try {
    const obj = JSON.parse(src);
    if (obj && typeof obj === 'object') return obj as Record<string, string>;
  } catch {}
  const out: Record<string, string> = {};
  src.split(/[;,]/).map(s => s.trim()).filter(Boolean).forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx > 0) out[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  });
  return Object.keys(out).length ? out : undefined;
}

const isProduction = process.env.APP_ENV === 'production';
const isStaging = process.env.APP_ENV === 'staging';
const isEnabled = process.env.OTEL_ENABLED === 'true' || isProduction || isStaging;

if (isEnabled) {
  const resource = new Resource({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'nestjs_otel',
  });

  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    headers: parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
  });

  const metricExporter = new OTLPMetricExporter({
    url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    headers: parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
  });

  const logExporter = new OTLPLogExporter({
    url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    headers: parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
  });

  const otelSDK = new NodeSDK({
    resource,
    contextManager: new AsyncLocalStorageContextManager(),
    spanProcessor: new BatchSpanProcessor(traceExporter),
    metricReader: new PeriodicExportingMetricReader({ exporter: metricExporter }),
    logRecordProcessor: new BatchLogRecordProcessor(logExporter),
    instrumentations: [
      new PinoInstrumentation(),
      new ExpressInstrumentation(),
      new NestInstrumentation(),
      new MongoDBInstrumentation(),
    ],
  });

  otelSDK.start();

  process.on('SIGTERM', () => {
    otelSDK.shutdown().finally(() => process.exit(0));
  });
}
