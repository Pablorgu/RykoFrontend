const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Excluye .svg de los assets
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);

// Incluye .svg como sourceExts
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

// Añade el transformer para SVG
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);

// Pasa config a nativewind
module.exports = withNativeWind(config, { input: "./global.css" });

