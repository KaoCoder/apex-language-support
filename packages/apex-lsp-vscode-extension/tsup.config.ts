/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the
 * repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { defineConfig, Options } from 'tsup';
import { Plugin } from 'esbuild';


export default defineConfig((options: Options) => {
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
      'vscode-languageserver-textdocument',
      'vscode-languageserver',
      'vscode-languageserver-protocol',
      'vscode-jsonrpc',
    ],
    // Ensure browser-compatible versions of packages are used
    esbuildOptions(options) {
      // Import polyfill configuration from unified apex-ls package
      const { applyPolyfillConfig } = require('../apex-ls/src/polyfills/config');

      // Configure for browser environment
      options.conditions = ['browser', 'import', 'module', 'default'];
      options.mainFields = ['browser', 'module', 'main'];
      
      // Inject polyfills globally
      options.inject = ['./src/polyfills.js'];
      
      // Add polyfill aliases for Node.js modules that don't work in browsers
      options.alias = {
        ...options.alias,
        // Add polyfills for Node.js built-in modules using npm browser-compatible packages
        'util': 'util',
        'buffer': 'buffer',
        'crypto': 'crypto-browserify',
        'events': 'events',
        'fs': 'memfs',
        'path': 'path-browserify',
        'stream': 'stream-browserify',
        'assert': 'assert',
      };
      
      options.define = {
        ...options.define,
        'process.env.NODE_ENV': '"browser"',
        'global': 'globalThis',
        'global.Buffer': 'Buffer',
      };
    },
    // Copy worker files, manifest, and fix paths/exports after build
    onSuccess:
      'npm run copy:worker && npm run copy:manifest && npm run fix:paths && npm run fix:exports && npm run fix:util',
  };
});
