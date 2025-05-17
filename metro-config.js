module.exports = {
  resolver: {
    /* resolver options */
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs'],
  },
  transformer: {
    /* transformer options */
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  },
};