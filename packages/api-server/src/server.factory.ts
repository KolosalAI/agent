/**
 * @license
 * Copyright 2025 Kolosal Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import http from 'http';
import url from 'url';
import type { Config } from '@kolosal-ai/kolosal-ai-core';
import type { ApiServerOptions, ApiServer } from './types/index.js';
import { GenerationService } from './services/generation.service.js';
import { HttpUtils } from './utils/http.js';
import { handleHealth } from './handlers/health.handler.js';
import { handleStatus } from './handlers/status.handler.js';
import { handleGenerate } from './handlers/generate.handler.js';
import { handleTools } from './handlers/tools.handler.js';

export function createApiServer(config: Config, options: ApiServerOptions): Promise<ApiServer> {
  const enableCors = options.enableCors ?? true;
  const generationService = new GenerationService(config);

  const server = http.createServer(async (req, res) => {
    const { pathname } = url.parse(req.url || '/', true);
    const method = req.method || 'GET';

    try {
      // Handle CORS preflight
      if (method === 'OPTIONS') {
        HttpUtils.writeCors(res, enableCors);
        res.statusCode = 204;
        res.end();
        return;
      }

      // Route requests
      if (method === 'GET' && pathname === '/healthz') {
        await handleHealth(req, res, config, enableCors);
      } else if (method === 'GET' && pathname === '/status') {
        await handleStatus(req, res, config, enableCors);
      } else if (method === 'GET' && pathname === '/v1/tools') {
        await handleTools(req, res, config, enableCors);
      } else if (method === 'POST' && pathname === '/v1/generate') {
        await handleGenerate(req, res, config, enableCors, generationService);
      } else {
        HttpUtils.sendJson(res, 404, { error: 'Not Found' }, enableCors);
      }
    } catch (err) {
      try {
        HttpUtils.sendJson(
          res,
          500,
          { error: (err as Error).message || 'Internal Server Error' },
          enableCors,
        );
      } catch {
        res.statusCode = 500;
        res.end();
      }
    }
  });

  return new Promise<ApiServer>((resolve, reject) => {
    server.on('error', reject);
    const host = options.host ?? '127.0.0.1';
    
    server.listen(options.port, host, () => {
      resolve({
        port: options.port,
        close: () => new Promise<void>((resClose) => server.close(() => resClose())),
      });
    });
  });
}