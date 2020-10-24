# Getting Started Part 2 - Rendr Engine

In our [previous tutorial](./getting-started.md), we created an api using Rendr.
This api returns `Page` objects that we can use to render our content.

## Consuming a Page

We could start from scratch but we already created an Express server in out previous example.
We are going to use it for our Rendr engine example.

As a rendering engine, we are going to use [Vue.js](https://vuejs.org/) and its server side rendering [tool](https://ssr.vuejs.org/#what-is-server-side-rendering-ssr)

In our tutorial, we are following the guidelines given in this [guide](https://ssr.vuejs.org/guide/#integrating-with-a-server)
as a starting point.

Create a file called `index.js` in an `engine` directory

```js
// engine/index.js
const Vue = require("vue");
const renderer = require("vue-server-renderer").createRenderer();

const vueRendr = (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>The visited URL is: {{ url }}</div>`
  });

  renderer.renderToString(app, (err, html) => {
    if (err) {
      res.status(500).end("Internal Server Error");
      return;
    }
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Hello</title></head>
        <body>${html}</body>
      </html>
    `);
  });
};

module.exports = {
  vueRendr
};
```

Update `app.js` to import this callback and attach it to a catchall route

```js
// app.js
// Add this line
const engine = require("./engine");
...
// Replace the route
// app.get('/', (req, res) => res.send('Hello World!'));
// with
app.get("/*", engine.vueRendr);
...
```

Create a file called `index.template.html` in the `engine` directory.
It will be the core of our Vue template.
It also includes a loop to render all the blocks of our `Page` response.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>{{ head.title }}</title>
  </head>

  <body>
    <h1>{{ head.title }}</h1>
    <div v-for="block in bodyBlocks">
      <default-component
        v-if="block.type === 'default'"
        :settings="block.settings"
      />
    </div>
  </body>
</html>
```

In order to get the `Page` objects, we are going to fetch the data coming from the api we created in the [first guide](./getting-started.md). Update `engine/index.js` with the following:

```js
// engine/index.js
const Vue = require("vue");
// Add Rendr dependencies
const renderer = require("vue-server-renderer").createRenderer();
const rendrCore = require("@ekino/rendr-core");
const rendrLoader = require("@ekino/rendr-loader");

const vueRendr = async (req, res) => {
  // Create a Rendr context
  const ctx = rendrCore.createContext(req, res);
  // Use the built-in ApiLoader to fetch the api that we created.
  const apiLoader = rendrLoader.createApiLoader("http://localhost:3000/api");
  const page = await apiLoader(ctx, new rendrCore.Page(), (page) => page);

  if (!page) {
    res.status(404).end("No page found!");
    return;
  }

  if (page.statusCode > 300) {
    res.status(page.statusCode).end(page.settings.message);
  }

  // Start of the Vue app
  const app = new Vue({
  ...

```

Finally, we are going to update our `Vue` app in order to dynamically render the blocks that
we received in our `Page` object.

```js
// engine/index.js

...
// Start of the Vue app
const app = new Vue({
  data: function() {
    return page;
  },
  components: {
    // The template of the default block
    "default-component": {
      props: ["settings"],
      template: `<div>
<h3>{{ settings.title }}</h3>
<div><span>{{ settings.message }}</span></div>
</div>`
    }
  },
  computed: {
    // A simple way to filter the blocks to only the ones which container is body
    bodyBlocks: function() {
      return this.blocks.filter(block => block.container === "body");
    }
  },
  // Use the template file we created
  template: require("fs").readFileSync("./engine/index.template.html", "utf-8")
});

renderer.renderToString(app, (err, html) => {
  console.log({ err });
  if (err) {
    res.status(500).end("Internal Server Error");
    return;
  }
  res.end(html);
});
```

Now let's test http://localhost:3000/, http://localhost:3000/article/foo and http://localhost:3000/article/foo+special

## Conclusion

We have created everything necessary to deal with the second step:

- We can consume a `Page`
- We can generate html serve side based on the definition of our `Page`

This example is using `Vue.js` to render the html serve side, but you can find more advanced [examples](https://github.com/ekino/rendr/tree/master/examples) that uses `Next.js` and `React`.
