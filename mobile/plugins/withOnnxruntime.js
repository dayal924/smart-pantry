const { withMainApplication, withAppBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');
const generateCode = require('@expo/config-plugins/build/utils/generateCode');

const withOnnxruntime = (config) => {
  // 1. Ensure implementation project(':onnxruntime-react-native') in app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = generateCode.mergeContents({
        src: config.modResults.contents,
        newSrc: "    implementation project(':onnxruntime-react-native')",
        tag: 'onnxruntime-react-native-dep',
        anchor: /^dependencies[ \t]*\{$/,
        offset: 1,
        comment: '    // onnxruntime-react-native',
      }).contents;
    }
    return config;
  });

  // 2. Add OnnxruntimePackage to MainApplication.kt
  config = withMainApplication(config, (config) => {
    let contents = config.modResults.contents;
    if (!contents.includes('import ai.onnxruntime.reactnative.OnnxruntimePackage')) {
      contents = contents.replace(
        /package com\.smartpantry\.app/,
        'package com.smartpantry.app\nimport ai.onnxruntime.reactnative.OnnxruntimePackage'
      );
    }
    if (!contents.includes('OnnxruntimePackage()')) {
      if (contents.includes('PackageList(this).packages.apply {')) {
        contents = contents.replace(
          'PackageList(this).packages.apply {',
          'PackageList(this).packages.apply {\n              add(OnnxruntimePackage())'
        );
      } else if (contents.includes('PackageList(this).packages')) {
        contents = contents.replace(
          'PackageList(this).packages',
          'PackageList(this).packages.apply { add(OnnxruntimePackage()) }'
        );
      }
    }
    config.modResults.contents = contents;
    return config;
  });

  return config;
};

module.exports = createRunOncePlugin(withOnnxruntime, 'withOnnxruntime', '1.0.0');

