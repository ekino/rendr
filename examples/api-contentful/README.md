# NextJS with Contentful

> Please note: this is a work a progress, there are no visual representations of the content.

This repository is a demo site running NextJS with a Headless CMS (Contentful). The Headless CMS is in charge of the page structure and the contents (articles).

The rendr project provide an advanced integration with Contentful witht the `@ekino/rendr-loader-contentful` module. Current features:

 - migration to create Page, Block, Article and Author models
 - data normalization layers 
 - API to access models

## How to setup the demo

>The `migrations.js` and `fixtures.js` script will *ERASE* and *DESTROY* any structures and contents related to those entities: `rndr_page`, `rendr_author`, `rendr_block_text`, `rendr_block_gallery`, `rendr_website`, `rendr_article` **WITH NO CONFIRMATION** (or any new entities starting with `rendr_`) 

### Setup models

> **Please note**: you need an account on Contentful and the `Management API Token` which allows to update the models schema on Contentful.

    CONTENTFUL_SPACE_ID=XXXX CONTENTFUL_MANAGEMENT_TOKEN=XXXX node node_modules/@ekino/rend-loader-contentful/src/migrations.js 

### Setup simple fixtures

    CONTENTFUL_SPACE_ID=XXXX CONTENTFUL_MANAGEMENT_TOKEN=XXXX node node_modules/@ekino/rend-loader-contentful/src/fixtures.js 

### run the demo

    CONTENTFUL_SPACE_ID=XXXX CONTENTFUL_ACCESS_TOKEN=XXXX node server.js