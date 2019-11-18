const rendrCore = require("@ekino/rendr-core");

/**
 * The generator will return a list of item. This one is simple as the list is static,
 * however we can image that the list is populated from remote api, etc ...
 *
 * A generator is used as it allow a low consumption of memory and can work with any
 * amount of data.
 */
async function* generator() {
  const baseUrl = "https://nextjs.rande.now.sh";
  const ref = rendrCore.createPageReference;
  const date = new Date();

  yield ref(`${baseUrl}/`, {
    priority: 1,
    lastmod: date
  });
  yield ref(`${baseUrl}/about`, {
    lastmod: date
  });
  yield ref(`${baseUrl}/humans.txt`, {
    lastmod: date
  });

  yield ref(`${baseUrl}/post`, {
    priority: 0.5,
    lastmod: date
  });

  for (let x = 0; x < 2000; x++) {
    if (x != 0 && x % 32 == 0) {
      yield ref(`${baseUrl}/post/page/${x / 32}`, {
        priority: 0.5,
        lastmod: date
      });
    }

    yield ref(`${baseUrl}/post/slug-${x}`, {
      priority: 0.5,
      lastmod: date
    });
  }
}

module.exports.generator = generator;
