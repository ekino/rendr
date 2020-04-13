// https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

function getErrorParameters(
  defaultMessage: string,
  args: any[]
): Partial<RendrError> {
  if (args.length === 0) {
    return {
      message: defaultMessage,
    };
  }

  if (args.length === 1 && typeof args[0] === "string") {
    return {
      message: args[0],
    };
  }

  if (args.length === 1 && typeof args[0] !== "string") {
    return {
      message: defaultMessage,
      previousError: args[0],
    };
  }

  if (args.length === 2) {
    return {
      message: args[0],
      previousError: args[1],
    };
  }

  throw Error("Unable to create a proper error");
}

export class RendrError /* extends Error */ {
  name: string;
  message: string;
  stack?: string;
  previousError: Error;

  constructor(previousError?: any);
  constructor(message?: string, previousError?: any);
  constructor(...args: any[]) {
    Object.assign(this, {
      ...getErrorParameters("Rendr Error", args),
      stack: new Error().stack,
      name: "RendrError",
    });
  }
}

// @ts-ignore
RendrError.prototype = Error.prototype;

export class NotFoundError extends RendrError {
  constructor(...args: any[]) {
    super();
    Object.assign(this, {
      ...getErrorParameters("Not Found Error", args),
      stack: new Error().stack,
      name: "NotFoundError",
    });
  }
}

export class InternalServerError extends RendrError {
  constructor(...args: any[]) {
    super();
    Object.assign(this, {
      ...getErrorParameters("Internal Server Error", args),
      stack: new Error().stack,
      name: "InternalServerError",
    });
  }
}

export class NormalizationError extends RendrError {
  constructor(...args: any[]) {
    super();
    Object.assign(this, {
      ...getErrorParameters("Normalization Error", args),
      stack: new Error().stack,
      name: "NormalizationError",
    });
  }
}
