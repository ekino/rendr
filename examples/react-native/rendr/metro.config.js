/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path');

const watchPackages = '../../../packages';
const watchNode = '../../../node_modules';

module.exports = {
  projectRoot: path.resolve(__dirname),
  watchFolders: [
    // Let's add the root folder to the watcher
    // for live reload purpose
    path.resolve(__dirname, watchPackages),
    path.resolve(__dirname, watchNode),
  ],
  resolver: {
    extraNodeModules: new Proxy(
      {},
      {
        get: (_target, name) => {
          let r = new RegExp('@ekino/(rendr)-(.*)');
          let result = name.match(r);
          if (!result) {
            return path.join(process.cwd(), `${watchNode}/${name}`);
          }

          return path.join(
            process.cwd(),
            `${watchPackages}/${result[1]}`,
          );
        },
      },
    ),
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
