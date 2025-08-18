/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the
 * repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => {
  // Always apply polyfill configuration for web compatibility
  // This ensures web builds work properly regardless of environment variables
  const { applyPolyfillConfig } = require('../apex-ls/src/polyfills/config');
  applyPolyfillConfig(options);

  return {
    entry: ['out/extension.js', 'out/server.js'],
    format: ['cjs', 'esm'],
    target: 'es2022',
    sourcemap: true,
    clean: true,
    minify: false,
    dts: false,
    external: ['vscode'],
    noExternal: [
      '@salesforce/apex-ls',
      '@salesforce/apex-lsp-compliant-services',
      '@salesforce/apex-lsp-custom-services',
      '@salesforce/apex-lsp-parser-ast',
      '@salesforce/apex-lsp-shared',
    ],
    // Ensure browser-compatible versions of packages are used
    esbuildOptions(options) {
      // Use neutral platform but prioritize browser fields
      options.conditions = ['browser', 'import', 'module', 'default'];
      options.mainFields = ['browser', 'module', 'main'];
      // Add alias to specifically target the problematic vscode-jsonrpc imports
      options.alias = {
        'vscode-jsonrpc/lib/node/main': 'vscode-jsonrpc/lib/browser/main',
        'vscode-jsonrpc/lib/node/ril': 'vscode-jsonrpc/lib/browser/ril',
      };
      options.define = {
        ...options.define,
        'global': 'globalThis',
      };
    },
    // Copy worker files, manifest, and fix paths/exports after build
    onSuccess: 'npm run copy:worker && npm run copy:manifest && npm run fix:paths && npm run fix:exports',
  };
});
