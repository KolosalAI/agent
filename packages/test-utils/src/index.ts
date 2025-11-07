/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

/**
 * Creates a temporary directory for testing purposes with optional file structure
 * @param structure Optional object describing the file/directory structure to create
 * @returns Promise<string> The path to the created temporary directory
 */
export async function createTmpDir(structure?: Record<string, any>): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kolosal-test-'));
  
  if (structure) {
    await createFileStructure(tmpDir, structure);
  }
  
  return tmpDir;
}

/**
 * Recursively creates file and directory structure
 * @param basePath The base path to create the structure in
 * @param structure The structure object to create
 */
async function createFileStructure(basePath: string, structure: Record<string, any>): Promise<void> {
  for (const [name, content] of Object.entries(structure)) {
    const fullPath = path.join(basePath, name);
    
    if (typeof content === 'string') {
      // Create a file with string content
      await fs.writeFile(fullPath, content, 'utf8');
    } else if (Array.isArray(content)) {
      // Create a directory and files within it
      await fs.mkdir(fullPath, { recursive: true });
      for (const fileName of content) {
        const filePath = path.join(fullPath, fileName);
        await fs.writeFile(filePath, '', 'utf8');
      }
    } else if (typeof content === 'object' && content !== null) {
      // Create a directory and recursively create its contents
      await fs.mkdir(fullPath, { recursive: true });
      await createFileStructure(fullPath, content);
    }
  }
}

/**
 * Cleans up a temporary directory created for testing
 * @param tmpDir The path to the temporary directory to clean up
 */
export async function cleanupTmpDir(tmpDir: string): Promise<void> {
  try {
    await fs.rm(tmpDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore errors during cleanup
    console.warn(`Failed to cleanup tmp dir ${tmpDir}:`, error);
  }
}