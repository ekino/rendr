import {
  PageReference,
  PageReferenceGenerators,
  Settings,
  TransformGenerator,
} from "./types";

import { finished as StreamFinished, Writable } from "stream";
import util from "util";

// we cannot call the code util.promisify to avoid issue with
// frontend build: The "original" argument must be of type Function
// if a js guru is around, feel free to help.
let finished: {
  (
    stream:
      | NodeJS.ReadableStream
      | NodeJS.WritableStream
      | NodeJS.ReadWriteStream
  ): Promise<void>;
  (arg0: Writable): void;
};

export function createPageReference(
  url: string,
  settings?: Settings
): PageReference {
  return {
    url,
    group: "",
    settings: settings ? settings : {},
  };
}

export function createPageReferencesGenerator(
  generators: PageReferenceGenerators
): () => AsyncGenerator<PageReference, void, void> {
  return async function* chainGenerators() {
    // tslint:disable-next-line:forin
    for (const group in generators) {
      const generator = generators[group];

      for await (const curr of generator()) {
        curr.group = group;

        yield curr;
      }
    }
  };
}

export async function* transformGenerator(
  generator: AsyncGenerator<any, any, any>,
  transform: TransformGenerator
) {
  for await (const curr of generator) {
    yield await transform(curr);
  }
}

export async function pipeIteratorToWritable(
  iterator: AsyncGenerator<string | Buffer, void, unknown>,
  writable: Writable
) {
  if (!finished) {
    finished = util.promisify(StreamFinished);
  }

  for await (const current of iterator) {
    writable.write(current);
  }

  writable.end();

  await finished(writable);
}
