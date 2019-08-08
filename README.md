# SSR with dynamic page structure

There are many challenges when doing Server Side Rendering with React (or any other similar stacks), it is not _only_ about setting up a state management, or select the best CSS framework. The first challenge is on the logical architecture level, where do we put business logic, how can we do data aggregation, how can we do http caching with user's data, etc ... The second challenge, is how can we add flexibility to the end user to administrate the page layouts or templates (and not only contents).

This project try to resolve these two challenges.

## Architecture

When do you need this kind of solution?

- You have internal data sources (microservices or legacy system)
- You have a CMS but don't want to add custom codes or don't want to expose it to the world
- You CMS cannot do the aggregation from different data sources
- You need to add some cache mechanisms to protect your internals systems

Understanding the different layers

- **Data**: Data sources, can be anything as long as the aggregation layer can access to those data. This data layer can be protected or cached by some middlewares. This is up to the implementation to do that work.
- **Aggregation**: The aggregation knows how to fetch the data and how to compose a page definition with all the required contents. The page is a set of information: page title, blocks with container name, cache information, etc ... The page structure can either be hard coded in the project or coming from an external CMS with a proper page builder or similar headless solutions.
- **Rendering engine**: This layer knows how to communicate with the aggregation layer, and render the final output to the client. The output can be anything, most of the case this will be html. But the rendering engine can be a PDF engine, a mobile application, mainly anything that can display information and interact with the user.

Note: The rendering engine should not contain any business rules, but only visual rules. All business rules have to be in the aggregation layer.

On a nutshell, the architecture is something like this:

        +-------------------------------+
        |        Rendering Engine       |
        +-------------------------------+
        +-------------------------------+
        |          Aggregation          |
        +-------------------------------+
        +--------+ +--------+ +---------+
        | Data 1 | | Data 2 | |   CMS   |
        +--------+ +--------+ +---------+

## Code organisation

The project uses `lerna` to handle multiple packages in one git repository. Packages are located in the `packages` folder. Each packages try to resolve one thing:

- **core** contains main definitions (Page, Context), so its the main dependency of other packages. The package contains code to normalize page definition.
- **aggregator** is a registry for service aggregators. A block from a page might need extra informations to be used. A closure can be attached to that registry, so it will be call once the page reference one known service. This can be used either on the Rendering engine or in the aggregation layer, of course the latter is better.
- **api** is a simple package to expose using json a Page definition coming from a loader.
- **loader** is the package responsable to load a page from a data source and return a page object with all information loaded from the datasource. It is possible to encapsulate this loader by others loaders if you need to add more information into the page definition.
- **template-react** is the package used to take a page definition and render the page to the client. This package works with React, contains registry to store block types with their rendering components.

The folder `examples/nextjs-with-remoteapi` is an example of all those packages can work together with NextJS to create a solution for dynamic pages (structure + contents) fully managed by a remote API.

## Contributing

Please see our [CONTRIBUTING.md](https://github.com/ekino/rendr/CONTRIBUTING.md).
