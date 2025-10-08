import 'dotenv/config'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core'
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb'
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino'

const enabled = String(process.env.OTEL_ENABLED ?? 'true') === 'true'

if (enabled) {
  const base = (process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://127.0.0.1:4318').replace(/\/+$/, '')
  const traceExporter = new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || `${base}/v1/traces` })
  const metricExporter = new OTLPMetricExporter({ url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || `${base}/v1/metrics` })
  const logExporter = new OTLPLogExporter({ url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT || `${base}/v1/logs` })

  const sdk = new NodeSDK({
    contextManager: new AsyncLocalStorageContextManager(),
    spanProcessor: new BatchSpanProcessor(traceExporter),
    metricReader: new PeriodicExportingMetricReader({ exporter: metricExporter }),
    logRecordProcessor: new BatchLogRecordProcessor(logExporter),
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new NestInstrumentation(),
      new MongoDBInstrumentation(),
      new PinoInstrumentation(),
    ],
  })

  try {
    const r = sdk.start() as any
    if (r && typeof r.then === 'function') r.catch(() => {})
  } catch {}

  const shutdown = () => {
    const r = sdk.shutdown() as any
    if (r && typeof r.then === 'function') r.finally(() => process.exit(0))
    else process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}
