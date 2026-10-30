const fs = require('fs');
const path = require('path');

const bindingPaths = [
  path.join(__dirname, '..', 'node_modules', 'onnxruntime-react-native', 'lib', 'binding.ts'),
  path.join(__dirname, '..', 'node_modules', 'onnxruntime-react-native', 'lib', 'binding.js'),
  path.join(__dirname, '..', 'node_modules', 'onnxruntime-react-native', 'dist', 'commonjs', 'binding.js'),
  path.join(__dirname, '..', 'node_modules', 'onnxruntime-react-native', 'dist', 'module', 'binding.js'),
];

for (const p of bindingPaths) {
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    // Replace unconditional Module.install() with safe guarded execution
    if (content.includes('Module.install();') && !content.includes('typeof Module.install === \'function\'')) {
      content = content.replace(
        'Module.install();',
        'try { if (Module && typeof Module.install === \'function\') { Module.install(); } } catch (e) { console.warn(\'ONNX install warning:\', e); }'
      );
      fs.writeFileSync(p, content, 'utf8');
      console.log('Patched', p);
    }
  }
}

// Ensure onnxruntime-react-native has react-native.config.js for React Native CLI autolinking
const ortPkgDir = path.join(__dirname, '..', 'node_modules', 'onnxruntime-react-native');
if (fs.existsSync(ortPkgDir)) {
  const ortRncPath = path.join(ortPkgDir, 'react-native.config.js');
  const ortRncContent = `module.exports = {
  dependency: {
    platforms: {
      android: {
        packageImportPath: 'import ai.onnxruntime.reactnative.OnnxruntimePackage;',
        packageInstance: 'new OnnxruntimePackage()',
      },
    },
  },
};
`;
  fs.writeFileSync(ortRncPath, ortRncContent, 'utf8');
  console.log('Created react-native.config.js in', ortPkgDir);
}

