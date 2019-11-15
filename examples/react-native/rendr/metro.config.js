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
        get: (target, name) => {
          let r = new RegExp('@ekino\/(rendr)-(.*)');
          let result = name.match(r);
          if(!result){
            return path.join(process.cwd(), `../../../node_modules/${name}`);
          }

          return path.join(process.cwd(), `../../../packages/${result[1]}`);
        },
      },
    ),
    extraNodeModules: {
      // Here I reference my upper folder
      '@sproutch/ui': path.resolve(__dirname, '../src'),
      // Important, those are all the dependencies
      // asked by the "../src" but which
      // are not present in the ROOT/node_modules
      // So install it in your RN project and reference them here
      expo: path.resolve(__dirname, 'node_modules/expo'),
      'lodash.merge': path.resolve(__dirname, 'node_modules/lodash.merge'),
      react: path.resolve(__dirname, 'node_modules/react'),
      reactxp: path.resolve(__dirname, 'node_modules/reactxp'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
    },
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
