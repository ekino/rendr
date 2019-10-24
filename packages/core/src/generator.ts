import {
  PageReference,
  PageReferenceGenerators,
  Settings,
  TransformGenerator
} from "./types";

export function createPageReference(
  url: string,
  settings?: Settings
): PageReference {
  return {
    url,
    group: "",
    settings: settings ? settings : {}
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
