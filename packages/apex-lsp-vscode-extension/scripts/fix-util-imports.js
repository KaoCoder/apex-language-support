#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Fixes Node.js util imports in the bundled extension files
 * by replacing them with our browser-compatible polyfill
 */
function fixUtilImports() {
  const extensionPath = path.resolve(__dirname, '../dist/extension.js');
  
  if (!fs.existsSync(extensionPath)) {
    console.log('⚠️ extension.js not found, skipping util import fix');
    return;
  }

  console.log('🔧 Fixing util imports in extension.js...');
  
  let content = fs.readFileSync(extensionPath, 'utf8');
  
  // Count original occurrences
  const originalUtilCount = (content.match(/require\("util"\)/g) || []).length;
  console.log(`📊 Found ${originalUtilCount} util imports to fix`);
  
  if (originalUtilCount === 0) {
    console.log('✅ No util imports found, nothing to fix');
    return;
  }
  
  // Replace require("util") with our polyfill
  // We'll inject the polyfill at the top and replace all require("util") calls
  const utilPolyfillCode = `
// Util polyfill for browser environment
var __util_polyfill = {
  isArray: Array.isArray,
  isBoolean: (value) => typeof value === 'boolean',
  isBuffer: (value) => value?.constructor?.name === 'Buffer' || false,
  isDate: (value) => value instanceof Date,
  isError: (value) => value instanceof Error,
  isFunction: (value) => typeof value === 'function',
  isNull: (value) => value === null,
  isNullOrUndefined: (value) => value === null || value === undefined,
  isNumber: (value) => typeof value === 'number',
  isObject: (value) => value !== null && typeof value === 'object',
  isString: (value) => typeof value === 'string',
  isSymbol: (value) => typeof value === 'symbol',
  isUndefined: (value) => value === undefined,
  TextEncoder: () => new globalThis.TextEncoder(),
  TextDecoder: () => new globalThis.TextDecoder(),
  promisify: (fn) => (...args) => new Promise((resolve, reject) => {
    fn(...args, (err, ...results) => {
      if (err) reject(err);
      else resolve(results.length === 1 ? results[0] : results);
    });
  }),
  inspect: (obj) => {
    if (obj === undefined) return 'undefined';
    if (obj === null) return 'null';
    if (typeof obj === 'string') return \`"\${obj}"\`;
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    if (typeof obj === 'function') return '[Function]';
    if (obj instanceof Date) return obj.toISOString();
    if (obj instanceof RegExp) return obj.toString();
    if (Array.isArray(obj)) return \`[\${obj.map(item => __util_polyfill.inspect(item)).join(', ')}]\`;
    if (typeof obj === 'object') {
      const props = Object.entries(obj).map(([key, val]) => \`\${key}: \${__util_polyfill.inspect(val)}\`);
      return \`{\${props.join(', ')}}\`;
    }
    return String(obj);
  },
  format: (format, ...args) => {
    let i = 0;
    return format.replace(/%[sdjifoO%]/g, (match) => {
      if (match === '%%') return '%';
      if (i >= args.length) return match;
      const value = args[i++];
      switch (match) {
        case '%s': return String(value);
        case '%d': return Number(value).toString();
        case '%i': return Math.floor(Number(value)).toString();
        case '%f': return Number(value).toString();
        case '%j': return JSON.stringify(value);
        case '%o':
        case '%O': return __util_polyfill.inspect(value);
        default: return match;
      }
    });
  }
};
// End util polyfill
`;
  
  // Replace all require("util") with util (our polyfill)
  content = content.replace(/require\("util"\)/g, 'util');
  
  // Add the polyfill at the beginning of the file (after any existing header comments)
  const firstRequireIndex = content.indexOf('var ');
  if (firstRequireIndex !== -1) {
    content = content.slice(0, firstRequireIndex) + utilPolyfillCode + content.slice(firstRequireIndex);
  } else {
    content = utilPolyfillCode + content;
  }
  
  fs.writeFileSync(extensionPath, content, 'utf8');
  
  // Verify the fix
  const fixedUtilCount = (content.match(/require\("util"\)/g) || []).length;
  console.log(`✅ Fixed util imports: ${originalUtilCount} → ${fixedUtilCount}`);
  console.log('✅ Util polyfill injected successfully');
}

try {
  fixUtilImports();
} catch (error) {
  console.error('❌ Error fixing util imports:', error);
  process.exit(1);
}