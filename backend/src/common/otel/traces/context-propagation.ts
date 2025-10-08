import { Context, context, propagation } from '@opentelemetry/api';
import { isPlainObject } from 'lodash';

export type Carrier = { traceparent?: string; tracestate?: string };

export function useContextPropagation(carrier?: Carrier): Context {
  if (carrier !== undefined && Object.keys(carrier).length > 0) {
    return propagation.extract(context.active(), carrier);
  }
  return context.active();
}

export function getContextPropagation(): Carrier {
  const carrier: Carrier = {};
  propagation.inject(context.active(), carrier);
  return carrier;
}

export function addPropagationToObject<T extends Record<string, any>>(obj: T): T & Carrier {
  const carrier = getContextPropagation();
  const out = isPlainObject(obj) ? obj : ({} as T);
  return { ...(out as any), ...carrier };
}
