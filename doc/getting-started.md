# Getting Started - Rendr API

In this tutorial we will create our first `hello world!` using Rendr.

The core concept that Rendr introduces is the usage of a `Page` object to represent
the structure of the content you want to render.

In simple terms, this could mean:

1. Take any source of data and build a `Page` with it. (Rendr API)
2. Take a `Page` and render anything with it. (Rendr Engine)

## Exposing a Page

Go into your working directory and then run

```sh
npm init
```

You now have a `package.json` file

Install the dependencies

```sh
npm add @ekino/rendr-api@^0.0.13
```

We're going to start by creating a simple server using express.
Following this [tutorial](https://expressjs.com/en/starter/hello-world.html), we can have something running very quickly.

Create a file called `api.js` in a `services` directory

```js
// services/api.js
const rendrLoader = require("@ekino/rendr-loader");

const routes = {
  // Create a route that matches the root of our endpoint
  // you will see below that we attach our services the the endpoint /api
  // this callback is called when you visit http://localhost:3000/api or http://localhost:3000/api/
  "(/|)": (ctx, page) => {
    page.head.title = "My first page";

    // add a block to the page
    page.blocks.push({
      container: "body",
      type: "default",
      settings: {
        title: "My first block",
        message: "Hello World!"
      },
      order: 0
    });

    return page;
  }
};

// Rendr comes with a set a predefined loaders
// createInMemoryLoader is a function that returns a loader
// capable of parsing urls and applies the associated callback when
// there is a match
module.exports.loader = rendrLoader.createInMemoryLoader(routes);
```

Now lets create a second route that will output our `Page` object.

```js
// app.js
const express = require("express");
// Add these lines
const rendrApi = require("@ekino/rendr-api");
const services = require("./services/api");
...
// Add the following line
// we attach our services under the endpoint /api
// This means any url in the format /api/something will be handled by our Loaders.
// Loaders behave in a similar way to express middleware
app.use('/api', (req, res) => rendrApi.createApi(services.loader));

app.get('/', (req, res) => res.send('Hello World!'));
...
```

Visit http://localhost:3000/api. Cool, isn't it?

## Understanding Loaders

Now, let's try http://localhost:3000/api/test

...It just waits.

Looking at the logs, we notice that an exception is thrown and never caught.
Fortunately, Rendr comes with a built-in Loader that catches exceptions of subsquent loaders
if they are chained.

Here is how it works:

```js
// services/api.js

// Replace your module export with

// createChainedLoader will create a single loader from a list of loaders.
// Each of them will be executed in sequence as long as they return the execution of the `next` function
module.exports.loader = rendrLoader.createChainedLoader([
  // Here is our error catcher
  rendrLoader.errorBoundaryLoader,
  rendrLoader.createInMemoryLoader(routes)
]);
```

Loaders behave like Express middleware. They are here to help you split responsibilities within your application.
In this example, we will create a second api route that reads an article slug and adds a block to the page with the slug in question.

This would look like:

```js
// services/api.js
...
const routes = {
  ...
  "(/article/:slug)": (ctx, page) => {
    page.head.title = "An article page";

    page.blocks.push({
      container: "body",
      type: "default",
      settings: {
        title: "An article block",
        // Read the slug value and display it into the block
        message: ctx.params["slug"]
      },
      order: 0
    });

    return page;
  }
};

```

Ok. This is a first step but before exposing this route, it would be nice to check if the user tried to place special characters in the url and reject the request if they did.

For that, we will create a new Loader:

```js
// services/api.js
// Add a new import
const rendrCore = require("@ekino/rendr-core")
...

// A custom loader that checks the slug and returns an error page if it contains a special character
function slugVerifierLoader(ctx, page, next) {
  // Someone is sending special characters
  if (ctx.params["slug"] && ctx.params["slug"].match(/[^a-zA-Z0-9-_]/)) {
    const errorPage = new rendrCore.Page();
    errorPage.statusCode = 400;
    errorPage.settings.message = "Bad Request!";

    return errorPage;
  }

  // Everything is fine, lets continue
  return next();
}

...

```

Excellent, now we need to chain the loaders for our article route.
Replace our previous route callback with:

```js
// services/api.js
...
const routes = {
  ...
  "/article/:slug": rendrLoader.createChainedLoader([
    slugVerifierLoader,
    // Note that we slightly changed the signature here to add a `next` parameter
    // so the signature of our page builder is compatible with a Loader
    (ctx, page, next) => {
      page.head.title = "An article page";

      page.blocks.push({
        container: "body",
        type: "default",
        settings: {
          title: "An article block",
          // Read the slug value and display it into the block
          message: ctx.params["slug"]
        },
        order: 0
      });
      return page;
    }
  ])
};

```

Now let's test http://localhost:3000/api/article/foo and http://localhost:3000/api/article/foo+special

## Conclusion

We have created everything necessary to deal with the first step:

- We can build `Page` objects
- We know how to chain `Loaders`
- Bonus: we have an endpoint that exposes all these `Page` objects for us to easily consume

If you want to know more about the possiblities offered by the library in term of loaders,
please consult the [examples](https://github.com/ekino/rendr/tree/master/examples).

In our [next chapter](./getting-started-2.md) we will see how we can use these pages to render content.
