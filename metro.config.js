const blacklist = require('metro-config/src/defaults/exclusionList');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    blacklistRE: blacklist([
      /\/nodejs-assets\/nodejs-project\/package.json/,
      /\/nodejs-assets\/nodejs-project\/yarn*/,
      /\/android\/.*/,
      /\/ios\/.*/,
    ]),
  },
};
