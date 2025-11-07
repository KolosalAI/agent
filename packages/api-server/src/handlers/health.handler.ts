/**
 * @license
 * Copyright 2025 Kolosal Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * Copyright 2025 Kolosal Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IncomingMessage, ServerResponse } from 'http';
import type { Config } from '@kolosal-ai/kolosal-ai-core';
import { HttpUtils } from '../utils/http.js';

export async function handleHealth(
  req: IncomingMessage,
  res: ServerResponse,
  config: Config,
  enableCors: boolean
): Promise<void> {
  HttpUtils.sendJson(res, 200, { status: 'ok' }, enableCors);
}