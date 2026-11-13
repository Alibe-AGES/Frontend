// Same SVGO setup as react-native-svg-transformer, plus prefixIds: on web every SVG shares one
// document, so the short ids SVGO gives each file's gradients (a, b, c...) would clash.
module.exports = {
  svgoConfig: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            inlineStyles: {
              onlyMatchedOnce: false,
            },
            removeViewBox: false,
            removeUnknownsAndDefaults: false,
            convertColors: false,
          },
        },
      },
      'prefixIds',
    ],
  },
};
