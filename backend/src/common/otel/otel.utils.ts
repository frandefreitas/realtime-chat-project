/* eslint-disable @typescript-eslint/ban-types */
export const copyMetadataFromFunctionToFunction = (
  originalFunction: Function,
  newFunction: Function,
): void => {
  Reflect.getMetadataKeys(originalFunction).forEach((metadataKey) => {
    Reflect.defineMetadata(
      metadataKey,
      Reflect.getMetadata(metadataKey, originalFunction),
      newFunction,
    );
  });
};

export const toSnakeCase = (str: string) => {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)!
    .map((x: string) => x.toLowerCase())
    .join('_');
};
