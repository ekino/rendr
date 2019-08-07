# Contributing

## Welcome

As you are going to enter to a new home, please make sure you respect those 3 basics rules:

- be respectful with everyone.
- be respectful with everyone.
- be respectful with everyone.

## Contributions

Everything is there for you to contribute on the project:
    
- a set of packages with small dependencies and limited scope.
- a full set example with nextjs using the code from packages (build)
- unit tests to ensure you don't introduce any regression.

What's do you need to know ?

- TypeScript... yeah !
- Understand issues with Server Side Rendering (mainly, there is no browser API on nodejs side, and there is no stream on Browsers too...)
- Portion on the code can run either on client and/or on server.

Start contributing!

    yarn setup # install dependencies
    yarn build # build packages

You can try to run the demo to check if everything is working fine:

    yarn examples/nextjs-with-remoteapi

The demo is a sandbox with some testing use cases to make sure we leverage all features from the NextJS framework. Please note, even if the example work with NextJS, most of the code can work with any others solutions as long you write the proper bridge.

