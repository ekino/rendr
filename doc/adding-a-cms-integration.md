# Adding a CMS integration

## Type of integration - CMS plugins vs custom module

Avoid building a node module for a specific CMS, try to use the built-in features of the CMS to generate an compatible API with Rendr. For instance, Drupal has features to build Json API, so it is better to use a drupal module as the maintainer can release compatible Drupal module when a new Drupal version is released.

If the solution does not provide a way to write custom plugin but provide an API, a node module is required (like contentful).

## Minimal Content Types

There are 3 units in rendr:

- A `block`: contains settings and the block type
- A `page`: contains several blocks and a page related information: header, template, path, etc ...
- A `website` (or a `channel`): contains a set of pages and can be use to target a client type or a specific domain.

The internal structure of the CMS does not have to respect these content types; however the public API need to output these content types. 

For instance, this is the output of one API call using the rendr format:

**Request**
```http
GET /api/ HTTP/2
Host: api.contents.com
```

**Response**
```
content-type: application/json; charset=utf-8
cache-control: public, max-age=0, must-revalidate
date: Fri, 29 Nov 2019 10:45:23 GMT
x-rendr-content-type: rendr/document
x-powered-by: MyCMS Solution
```
```json
{
  "statusCode": 200,
  "type": "document",
  "template": "rendr",
  "cache": {
    "ttl": 0
  },
  "head": {
    "titleTemplate": "Ekino - %s",
    "defaultTitle": "-",
    "title": "-",
    "link": "",
    "htmlAttributes": {},
    "meta": []
  },
  "blocks": [
    {
      "id": "the-id",
      "container": "header",
      "type": "rendr.header",
      "settings": {},
      "order": 0
    },
    {
      "id": "asd-asd",
      "container": "footer",
      "type": "rendr.footer",
      "settings": {},
      "order": 0
    },
    {
      "id": "113",
      "container": "body",
      "type": "rendr.jumbotron",
      "settings": {
        "title": "Rendr (by ekino.)",
        "contents": "A page rendering engine built on top of React and NextJS."
      },
      "order": 0
    },
    {
      "id": "12313ad",
      "container": "body",
      "type": "rendr.text",
      "settings": {
        "rawHtml": true,
        "contents": "\n          Rendr provides a solution to build configurable pages by using optional chainable services: \n          <ul>\n            <li>page loader</li>\n            <li>aggregator to enrich component with external data</li>\n            <li>the template rendering engine</li>\n          </ul>\n\n          Rendr leverage the NextJS framework (DX, performance, code splitting).\n        "
      },
      "order": 0
    }
  ],
  "settings": {},
  "id": "",
  "path": "/"
}
```

> There is no convention on the container name or the type. In the rendr code base, container can be `header`, `body` or `footer` and the type names are `rendr.text`, `rendr.header`, `rendr.footer`. But there is no mandatory naming on those elements. However if a code is used on the API, the rendering engine must have registered components with these elements.

The `id` fields are string as some can be `uuid`, `string` or any other unique indintifier format.

## Requirements

 - The integration should provide an automated solution to load datastructure definition using the CMS features (migrations, api call, etc ...)
 - The integration should provide a set of fixtures: to test the solution and demonstrate how that works.
 - The demo should respect the section "Demon" in this documents.

## Demo

The main purpose of the demo is to make sure all elements are there to have a good integration with the different rendering engines that might be used.

### API Paths

**JSON result**

- `/`: should return the homepage
- `/about`: should return the about page
- `/articles`: should return the articles page with a list of post and an pagination section => the API should accept a `page` query string.
- `/articles/:slug`: should return a page with the current blog post corresponding to the `slug` field.
- `/error/:errorCode`: return an error page with ``errorCode`` as the ``statusCode`` of the response.
- `/exception/:type`: Should return an exception (`type` can `NotFoundError`, `InternalServerError` or `NormalizationError`).

**Binary results**

- `/humans.txt`: should return an `application/text` stream with an `humans.txt` content => https://humanstxt.org/
- `/sitemap.xml`: should return a sitemap of all pages (limit to 50K pages or 10MB files). This file can be use by static site generator to load all the pages required to be generated...

### Dataset

The current types (or equivalent) need to be available in the CMS backoffice

**Website: Test**

```
name = "Test"
domains = ["localhost", "127.0.0.1"]
path = "/"
culture = "en_GB"
order = 1
enabled = true
```

**Page: Homepage**
```
title = "Homepage"
seo description = "The homepage"
seo keywords = ["The homepage", "awesome"]
path = "/"
website = Reference to the "test" website
blocks = [
  [
    container = "body"
    order = 1
    type = "rendr.text"
    settings = [
      title = "welcome"
      subtitle = ""
      contents = "This is the welcome text, enjoy this website"
      mode = "standard"
      image = ""
      image_position = ""
    ]
  ]
]
layout = "default"
ttl = 3600
```

**About**
```
title = "About"
seo description = "About page"
seo keywords = ["About"]
path = "/about"
website = Reference to the "test" website
blocks = [
  [
    container = "body"
    order = 1
    type = "rendr.text"
    settings = [
      title = "About"
      subtitle = ""
      contents = "This is a demo website of the CMD integration with a rendering engine. If you want more information please go to ..."
      mode = "standard"
      image = ""
      image_position = ""
    ]
  ]
]
layout = "default"
ttl = 3600
```

**Articles list**
```
title = "Articles"
seo description = "Article archives"
seo keywords = ["article"]
path = "/articles"
website = Reference to the "test" website
blocks = [
  [
    container = "body"
    order = 1
    type = "rendr.text"
    settings = [
      title = "Article"
      subtitle = ""
      contents = "Here the selections of contents"
      mode = "standard"
      image = ""
      image_position = ""
    ]
  ],
  [
    container = "body"
    order = 2
    type = "article.list"
    settings = [
      page = 0
      limit = 32
    ]
  ]
]
layout = "default"
ttl = 3600
```

**Articles view**
```
title = "Articles view"
seo description = "Article view"
seo keywords = ["article"]
path = "/articles/:slug"
website = Reference to the "test" website
blocks = [
  [
    container = "body"
    order = 1
    type = "article.view"
    settings = []
  ]
]
layout = "default"
ttl = 3600
```
