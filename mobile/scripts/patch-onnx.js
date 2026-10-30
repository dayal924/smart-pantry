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
      console.log('Patched Module.install in', p);
    }
    // Replace throwing proxy getter with safe lazy handler so route scanning doesn't crash on listSupportedBackends
    if (content.includes('OrtApi is not initialized') && !content.includes('listSupportedBackends')) {
      content = content.replace(
        /get:\s*\(\)\s*=>\s*\{\s*throw new Error\('OrtApi is not initialized[^']+'\);\s*\}/g,
        `get: (_target, prop) => {
          if (typeof globalThis.OrtApi !== 'undefined' && globalThis.OrtApi && globalThis.OrtApi[prop] !== undefined) return globalThis.OrtApi[prop];
          if (prop === 'listSupportedBackends') return () => ['cpu'];
          return (...args) => {
            if (typeof globalThis.OrtApi !== 'undefined' && globalThis.OrtApi && typeof globalThis.OrtApi[prop] === 'function') return globalThis.OrtApi[prop](...args);
            throw new Error('OrtApi is not initialized. Please make sure Onnxruntime installation is successful.');
          };
        }`
      );
      fs.writeFileSync(p, content, 'utf8');
      console.log('Patched OrtApi proxy in', p);
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

