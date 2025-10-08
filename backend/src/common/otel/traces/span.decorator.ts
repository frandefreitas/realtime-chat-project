import { Span as ApiSpan, SpanOptions, SpanStatusCode, trace } from '@opentelemetry/api';
import { copyMetadataFromFunctionToFunction } from '@/common/otel/otel.utils';
import { OTEL_SERVICE_NAME } from '../otel.constants';

type SpanDecoratorOptions = SpanOptions & { args: false | boolean[] };

const recordException = (span: ApiSpan, error: any) => {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR, message: error?.message });
};

export const Span =
  (name?: string, options?: SpanDecoratorOptions) =>
  (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const className = target.constructor?.name || 'Anonymous';
    const spanName = name || `${OTEL_SERVICE_NAME}:${className}.${String(propertyKey)}`;
    const userOptions: SpanDecoratorOptions = { args: false, ...(options || {}) };

    const original = descriptor.value;
    const wrapped = async function (...args: any[]) {
      const tracer = trace.getTracer(OTEL_SERVICE_NAME);
      const span = tracer.startSpan(spanName, userOptions);
      try {
        if (userOptions.args && Array.isArray(userOptions.args)) {
          const attributes: Record<string, string> = {};
          const max = Math.max(args.length, userOptions.args.length);
          for (let i = 0; i < max; i++) {
            if (!userOptions.args[i]) continue;
            const v = args[i];
            const t = typeof v;
            if (t === 'function') attributes[`args.${i}`] = `[Function:${v.name || 'anonymous'}]`;
            else if (t === 'object') attributes[`args.${i}`] = JSON.stringify(v ?? null);
            else attributes[`args.${i}`] = String(v);
          }
          span.setAttributes(attributes as any);
        }
        const res = await original.apply(this, args);
        return res;
      } catch (err) {
        recordException(span, err);
        throw err;
      } finally {
        span.end();
      }
    };

    copyMetadataFromFunctionToFunction(original, wrapped);
    descriptor.value = wrapped;
    return descriptor;
  };
