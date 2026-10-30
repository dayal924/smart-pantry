const fs = require('fs');
const path = require('path');

const bindingPaths = [
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
