import { MetricOptions } from '@opentelemetry/api';
import { getOrCreateCounter } from '@/common/otel/metrics/metrics';
import { copyMetadataFromFunctionToFunction, toSnakeCase } from '@/common/otel/otel.utils';

export const OtelMethodCounter =
  (name?: string, options?: MetricOptions) =>
  (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) => {
    const className = target.constructor.name;
    const metricName =
      name || `${toSnakeCase(className)}.${toSnakeCase(propertyKey.toString())}_calls`;
    const description = `Method ${className}.${propertyKey.toString()} calls count`;
    const counter = getOrCreateCounter(metricName, { description, ...(options || {}) });

    const original = descriptor.value!;
    const wrapped = function (...args: any[]) {
      counter.add(1);

      return original.apply(this, args);
    };

    copyMetadataFromFunctionToFunction(original, wrapped);
    descriptor.value = wrapped;
    return descriptor;
  };
