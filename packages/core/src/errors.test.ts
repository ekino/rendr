import {
  NotFoundError,
  InternalServerError,
  NormalizationError,
  RendrError
} from "./errors";

const errors = [
  {
    class: NotFoundError,
    message: "Not Found Error",
    name: "NotFoundError"
  },
  {
    class: InternalServerError,
    message: "Internal Server Error",
    name: "InternalServerError"
  },
  {
    class: NormalizationError,
    message: "Normalization Error",
    name: "NormalizationError"
  }
];

describe("test errors", () => {
  errors.forEach(error => {
    it(`${error.message} > should return default message`, () => {
      const err = new error.class();

      expect(err instanceof RendrError).toBeTruthy();
      expect(err instanceof error.class).toBeTruthy();
      expect(err instanceof Error).toBeTruthy();
      expect(err.stack).toBeDefined();
      expect(err.toString()).toEqual(`${error.name}: ${error.message}`);
    });

    it(`${error.message} > should return custom message`, () => {
      const err = new error.class("custom message");
      expect(err.message).toEqual(`custom message`);
      expect(err).toMatchSnapshot();
    });

    it(`${error.message} > should return previous error, with default message`, () => {
      const previousError = new Error("My Error");

      const err = new error.class(previousError);
      expect(err.message).toEqual(error.message);
      expect(err.previousError).toMatchObject(previousError);
    });
  });
});
