/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the
 * repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => {
  if (options.env?.BROWSER) {
    // Import and apply polyfill configuration from apex-ls package
    const { applyPolyfillConfig } = require('../apex-ls/src/polyfills/config');
    applyPolyfillConfig(options);
  }

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
  };
});
