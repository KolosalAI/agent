/**
 * @license
 * Copyright 2025 Kolosal Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

// Main API server exports
export { startApiServer } from './server.js';
export type { ApiServerOptions, ApiServer } from './types/index.js';

// Additional exports for advanced usage
export { createApiServer } from './server.factory.js';
export { handleHealth } from './handlers/health.handler.js';
export { handleStatus } from './handlers/status.handler.js'; 
export { handleGenerate } from './handlers/generate.handler.js';
export type { 
  GenerateRequest,
  GenerateResponse,
  GenerationResult,
  TranscriptItem,
  StreamEventCallback,
  ContentStreamCallback
} from './types/index.js';