/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path');

module.exports = {
  projectRoot: path.resolve(__dirname),
  watchFolders: [
    // Let's add the root folder to the watcher
    // for live reload purpose
    path.resolve(__dirname, '../../../packages'),
    path.resolve(__dirname, '../../../node_modules'),
  ],
  resolver: {
    extraNodeModules: new Proxy(
      {},
      {
        get: (_target, name) => {
          let r = new RegExp('@ekino\/(rendr)-(.*)');
          let result = name.match(r);
          if(!result){
            return path.join(process.cwd(), `../../../node_modules/${name}`);
          }

          return path.join(process.cwd(), `../../../packages/${result[1]}`);
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
