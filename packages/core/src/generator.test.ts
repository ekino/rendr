import { AsyncPageReferenceGenerator } from "./types";
import {
  createPageReferencesGenerator,
  createPageReference,
} from "./generator";

async function* pagesGenerator(): AsyncPageReferenceGenerator {
  await new Promise((resolve) => setTimeout(resolve, 10));

  yield createPageReference("https://localhost/" + "x".repeat(40 - 18), {
    lastmod: "2005-01-01",
  });

  await new Promise((resolve) => setTimeout(resolve, 10));

  yield createPageReference("https://localhost/", {
    lastmod: "2005-01-01",
  });
}

describe("Test generator for page listing", () => {
  test("test createPageGenerator", async () => {
    const generator = createPageReferencesGenerator({
      group_1: pagesGenerator,
      group_2: pagesGenerator,
    });

    const iter = generator();

    let cpt = 0;
    for await (const curr of iter) {
      cpt++;
    }

    expect(cpt).toBe(4);
  });
});
