/**
 * @license
 * Copyright 2025 Kolosal Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IncomingMessage, ServerResponse } from 'http';
import type { Config } from '@kolosal-ai/kolosal-ai-core';
import { GenerationService } from '../services/generation.service.js';
import { HttpUtils } from '../utils/http.js';

export async function handleTools(
  req: IncomingMessage,
  res: ServerResponse,
  config: Config,
  enableCors: boolean,
): Promise<void> {
  try {
    const generationService = new GenerationService(config);
    const tools = generationService.getAvailableTools();

    HttpUtils.sendJson(
      res,
      200,
      { tools },
      enableCors,
    );
  } catch (e) {
    HttpUtils.sendJson(
      res,
      500,
      { error: (e as Error).message },
      enableCors,
    );
  }
}