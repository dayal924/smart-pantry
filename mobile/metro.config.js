const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('onnx'); // bundle detector.onnx as an asset
module.exports = config;
