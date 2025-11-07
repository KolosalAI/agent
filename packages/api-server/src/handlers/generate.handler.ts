/**
 * @license
 * Copyright 2025 Kolosal Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IncomingMessage, ServerResponse } from 'http';
import type { Config } from '@kolosal-ai/kolosal-ai-core';
import type { GenerateRequest } from '../types/index.js';
import { GenerationService } from '../services/generation.service.js';
import { HttpUtils } from '../utils/http.js';

export async function handleGenerate(
  req: IncomingMessage,
  res: ServerResponse,
  config: Config,
  enableCors: boolean,
  generationService: GenerationService
): Promise<void> {
  let body: GenerateRequest;
  try {
    body = await HttpUtils.readJsonBody<GenerateRequest>(req);
  } catch (e) {
    return HttpUtils.sendJson(
      res,
      400,
      { error: (e as Error).message },
      enableCors,
    );
  }

  const input = (body?.input ?? '').toString();
  const stream = Boolean(body?.stream);
  const promptId = body?.prompt_id || Math.random().toString(16).slice(2);
  const history = body?.history;
  const model = body?.model;
  const apiKey = body?.api_key;
  const baseUrl = body?.base_url;
  const workingDirectory = body?.working_directory;

  if (!input) {
    return HttpUtils.sendJson(
      res,
      400,
      { error: 'Missing required field: input' },
      enableCors,
    );
  }

  const abortController = new AbortController();
  req.on('close', () => abortController.abort());

  try {
    if (stream) {
      await handleStreamingResponse(
        input,
        promptId,
        history,
        abortController.signal,
        res,
        enableCors,
        generationService,
        model,
        apiKey,
        baseUrl,
        workingDirectory,
      );
    } else {
      await handleNonStreamingResponse(
        input,
        promptId,
        history,
        abortController.signal,
        res,
        enableCors,
        generationService,
        model,
        apiKey,
        baseUrl,
        workingDirectory,
      );
    }
  } catch (e) {
    if (stream) {
      HttpUtils.writeSse(res, 'error', JSON.stringify({ message: (e as Error).message }));
      res.end();
    } else {
      HttpUtils.sendJson(res, 500, { error: (e as Error).message }, enableCors);
    }
  }
}

async function handleStreamingResponse(
  input: string,
  promptId: string,
  history: any,
  signal: AbortSignal,
  res: ServerResponse,
  enableCors: boolean,
  generationService: GenerationService,
  model?: string,
  apiKey?: string,
  baseUrl?: string,
  workingDirectory?: string,
): Promise<void> {
  HttpUtils.setupSseHeaders(res, enableCors);

  let lastEventType: string | null = null;
  let previousContentEmpty = true;

  const { history: updatedHistory, usage } = await generationService.generateResponse(
    input,
    promptId,
    signal,
    {
      onContentChunk: (chunk) => {
        let filteredChunk = chunk;
        if (previousContentEmpty || lastEventType === 'tool_result') {
          filteredChunk = chunk.replace(/^\n+/, '');
        }
        
        filteredChunk = filteredChunk.replace(/\n{3,}/g, '\n\n');
        
        if (filteredChunk === '') return;
        
        HttpUtils.writeSse(res, 'content', filteredChunk);
        previousContentEmpty = filteredChunk.trim() === '';
        lastEventType = 'content';
      },
      onEvent: (item) => {
        HttpUtils.writeSse(res, item.type, JSON.stringify(item));
        lastEventType = item.type;
        if (item.type === 'tool_call' || item.type === 'tool_result') {
          previousContentEmpty = true;
        }
      },
      conversationHistory: history,
      model,
      apiKey,
      baseUrl,
      workingDirectory,
    },
  );

  HttpUtils.writeSse(res, 'history', JSON.stringify(updatedHistory));
  
  if (usage) {
    HttpUtils.writeSse(res, 'usage', JSON.stringify(usage));
  }
  
  HttpUtils.writeSse(res, 'done', 'true');
  res.end();
}

async function handleNonStreamingResponse(
  input: string,
  promptId: string,
  history: any,
  signal: AbortSignal,
  res: ServerResponse,
  enableCors: boolean,
  generationService: GenerationService,
  model?: string,
  apiKey?: string,
  baseUrl?: string,
  workingDirectory?: string,
): Promise<void> {
  const { finalText, transcript, history: updatedHistory, usage } = 
    await generationService.generateResponse(
      input,
      promptId,
      signal,
      {
        conversationHistory: history,
        model,
        apiKey,
        baseUrl,
        workingDirectory,
      },
    );

  const cleanedFinalText = cleanFinalText(finalText, transcript);

  HttpUtils.sendJson(
    res,
    200,
    { 
      output: cleanedFinalText, 
      prompt_id: promptId, 
      messages: transcript,
      history: updatedHistory,
      usage,
    },
    enableCors,
  );
}

function cleanFinalText(finalText: string, transcript: any[]): string {
  if (!finalText) return finalText;

  let cleanedText = finalText;

  const lastEvent = transcript[transcript.length - 1];
  const secondLastEvent = transcript.length > 1 ? transcript[transcript.length - 2] : null;
  
  if (cleanedText.startsWith('\n') && 
      (lastEvent?.type === 'tool_result' || secondLastEvent?.type === 'tool_result')) {
    cleanedText = cleanedText.replace(/^\n+/, '');
  }

  cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');

  if (cleanedText.trim() === '') {
    return '';
  }

  return cleanedText;
}