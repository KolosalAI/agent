/**
 * @license
 * Copyright 2025 Kolosal Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IncomingMessage, ServerResponse } from 'http';
import type { Config } from '@kolosal-ai/kolosal-ai-core';
import { HttpUtils } from '../utils/http.js';

export async function handleStatus(
  req: IncomingMessage,
  res: ServerResponse,
  config: Config,
  enableCors: boolean
): Promise<void> {
  HttpUtils.sendJson(
    res,
    200,
    {
      status: 'ready',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      mode: 'server-only',
      endpoints: {
        generate: '/v1/generate',
        health: '/healthz',
        status: '/status'
      },
      features: {
        streaming: true,
        conversationHistory: true,
        toolExecution: true
      }
    },
    enableCors,
  );
}