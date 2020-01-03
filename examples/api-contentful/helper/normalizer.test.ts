import { createNormalizer, loadJson } from "@ekino/rendr-loader-contentful";
import {
  normalizeBlockText,
  normalizeArticle,
  normalizeAuthor,
  normalizeBlockFooter,
  normalizeBlockHeader
} from "./normalizer";

const files = ["rendr_article", "rendr_author", "rendr_block_text"];

describe("test normalization", () => {
  files.forEach(file => {
    it(`test ${file}.json`, () => {
      const normalizer = createNormalizer({
        rendr_author: normalizeAuthor,
        rendr_article: normalizeArticle,
        rendr_block_text: normalizeBlockText,
        rendr_block_footer: normalizeBlockFooter,
        rendr_block_header: normalizeBlockHeader
      });

      const entry = loadJson(
        `${__dirname}/__fixtures__/normalizer/${file}.json`
      );
      const block = normalizer(entry);

      expect(block).toBeDefined();
      expect(block).toMatchSnapshot();
    });
  });
});
