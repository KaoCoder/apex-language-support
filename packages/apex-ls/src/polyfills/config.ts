/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the
 * repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from 'path';
import { BuildOptions } from 'esbuild';

const polyfillsDir = path.resolve(__dirname);

export const polyfillPaths = {
  buffer: path.resolve(polyfillsDir, 'buffer-polyfill.ts'),
  crypto: path.resolve(polyfillsDir, 'crypto-polyfill.ts'),
  events: path.resolve(polyfillsDir, 'events-polyfill.ts'),
  fs: path.resolve(polyfillsDir, 'fs-polyfill.ts'),
  net: path.resolve(polyfillsDir, 'net-polyfill.ts'),
  os: path.resolve(polyfillsDir, 'os-polyfill.ts'),
  path: path.resolve(polyfillsDir, 'path-polyfill.ts'),
  utils: path.resolve(polyfillsDir, 'utils-polyfill.ts'),
};

export function applyPolyfillConfig(options: BuildOptions): void {
  options.alias = {
    ...options.alias,
    assert: 'assert',
    buffer: polyfillPaths.buffer,
    crypto: polyfillPaths.crypto,
    events: polyfillPaths.events,
    fs: polyfillPaths.fs,
    net: polyfillPaths.net,
    os: polyfillPaths.os,
    path: polyfillPaths.path,
    process: 'process/browser',
    stream: 'stream-browserify',
    util: polyfillPaths.utils,
  };

  options.inject = [
    polyfillPaths.buffer,
    polyfillPaths.path,
    polyfillPaths.os,
    polyfillPaths.crypto,
    polyfillPaths.net,
    polyfillPaths.events,
    ...(options.inject || []),
  ];

  options.define = {
    ...options.define,
    'process.env.NODE_ENV': '"browser"',
    global: 'globalThis',
    'global.Buffer': 'Buffer',
  };
}
