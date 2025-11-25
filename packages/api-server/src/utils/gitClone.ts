/**
 * @license
 * Copyright 2025 Kolosal Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Environment variable names for GitHub repository cloning
 */
export const GIT_ENV_VARS = {
  /** GitHub repository path in format 'owner/repo' or full URL */
  REPO_PATH: 'GITHUB_REPO_PATH',
  /** GitHub OAuth access token for private repositories */
  ACCESS_TOKEN: 'GITHUB_ACCESS_TOKEN',
  /** Optional: Branch to clone (defaults to main/master) */
  BRANCH: 'GITHUB_REPO_BRANCH',
  /** Optional: Target directory for cloning (defaults to /app/workspace) */
  WORKSPACE_DIR: 'AGENT_WORKSPACE_DIR',
} as const;

export interface GitCloneConfig {
  repoPath: string;
  accessToken?: string;
  branch?: string;
  workspaceDir: string;
}

export interface GitCloneResult {
  success: boolean;
  workspaceDir: string;
  message: string;
  error?: Error;
}

/**
 * Parses environment variables to get Git clone configuration
 * @returns GitCloneConfig if repo path is set, null otherwise
 */
export function getGitCloneConfigFromEnv(): GitCloneConfig | null {
  const repoPath = process.env[GIT_ENV_VARS.REPO_PATH];
  
  if (!repoPath) {
    return null;
  }

  return {
    repoPath,
    accessToken: process.env[GIT_ENV_VARS.ACCESS_TOKEN],
    branch: process.env[GIT_ENV_VARS.BRANCH],
    workspaceDir: process.env[GIT_ENV_VARS.WORKSPACE_DIR] || '/app/workspace',
  };
}

/**
 * Builds a Git clone URL with optional authentication
 * @param repoPath - Repository path (owner/repo) or full URL
 * @param accessToken - Optional OAuth access token for authentication
 * @returns Formatted Git URL
 */
export function buildGitUrl(repoPath: string, accessToken?: string): string {
  // If it's already a full URL, parse and potentially add auth
  if (repoPath.startsWith('https://') || repoPath.startsWith('git@')) {
    if (accessToken && repoPath.startsWith('https://github.com/')) {
      // Insert token into HTTPS URL
      return repoPath.replace(
        'https://github.com/',
        `https://oauth2:${accessToken}@github.com/`
      );
    }
    return repoPath;
  }

  // Assume it's in owner/repo format
  const baseUrl = accessToken
    ? `https://oauth2:${accessToken}@github.com/`
    : 'https://github.com/';
  
  // Ensure .git suffix
  const normalizedPath = repoPath.endsWith('.git') ? repoPath : `${repoPath}.git`;
  
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Clones a GitHub repository to the workspace directory
 * @param config - Git clone configuration
 * @returns Result of the clone operation
 */
export async function cloneRepository(config: GitCloneConfig): Promise<GitCloneResult> {
  const { repoPath, accessToken, branch, workspaceDir } = config;

  try {
    // Create workspace directory if it doesn't exist
    if (!fs.existsSync(workspaceDir)) {
      fs.mkdirSync(workspaceDir, { recursive: true });
      console.log(`Created workspace directory: ${workspaceDir}`);
    }

    // Check if directory is empty or contains a git repo
    const dirContents = fs.readdirSync(workspaceDir);
    const gitDir = path.join(workspaceDir, '.git');
    
    if (fs.existsSync(gitDir)) {
      // Repository already exists, try to pull latest changes
      console.log(`Git repository already exists in ${workspaceDir}, pulling latest changes...`);
      
      try {
        // Set up credentials if token is provided
        if (accessToken) {
          const gitUrl = buildGitUrl(repoPath, accessToken);
          await execAsync(`git remote set-url origin "${gitUrl}"`, { cwd: workspaceDir });
        }
        
        const pullCommand = branch 
          ? `git pull origin ${branch}`
          : 'git pull';
        
        const { stdout, stderr } = await execAsync(pullCommand, { cwd: workspaceDir });
        console.log('Git pull output:', stdout || stderr);
        
        return {
          success: true,
          workspaceDir,
          message: `Successfully pulled latest changes for ${repoPath}`,
        };
      } catch (pullError) {
        console.warn('Failed to pull, will continue with existing repository:', pullError);
        return {
          success: true,
          workspaceDir,
          message: `Using existing repository in ${workspaceDir} (pull failed)`,
        };
      }
    }

    // If directory has content but no .git, we need to handle it
    if (dirContents.length > 0) {
      console.warn(`Workspace directory ${workspaceDir} is not empty and not a git repo`);
      // Clone to a subdirectory instead
      const repoName = extractRepoName(repoPath);
      const cloneTarget = path.join(workspaceDir, repoName);
      
      if (fs.existsSync(cloneTarget)) {
        return {
          success: true,
          workspaceDir: cloneTarget,
          message: `Repository already cloned at ${cloneTarget}`,
        };
      }
      
      return await performClone(repoPath, accessToken, branch, cloneTarget);
    }

    // Directory is empty, clone directly into it
    return await performClone(repoPath, accessToken, branch, workspaceDir);

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Failed to clone repository:', err.message);
    
    return {
      success: false,
      workspaceDir,
      message: `Failed to clone repository: ${err.message}`,
      error: err,
    };
  }
}

/**
 * Performs the actual git clone operation
 */
async function performClone(
  repoPath: string,
  accessToken: string | undefined,
  branch: string | undefined,
  targetDir: string
): Promise<GitCloneResult> {
  const gitUrl = buildGitUrl(repoPath, accessToken);
  
  // Build clone command
  let cloneCommand = `git clone`;
  if (branch) {
    cloneCommand += ` --branch ${branch}`;
  }
  cloneCommand += ` --depth 1`; // Shallow clone for faster startup
  cloneCommand += ` "${gitUrl}" "${targetDir}"`;
  
  console.log(`Cloning repository: ${repoPath} to ${targetDir}`);
  
  // Execute clone (mask token in logs)
  const { stdout, stderr } = await execAsync(cloneCommand);
  
  if (stdout) console.log('Clone stdout:', stdout);
  if (stderr) console.log('Clone stderr:', stderr);
  
  return {
    success: true,
    workspaceDir: targetDir,
    message: `Successfully cloned ${repoPath} to ${targetDir}`,
  };
}

/**
 * Extracts repository name from path or URL
 */
function extractRepoName(repoPath: string): string {
  // Remove .git suffix if present
  const withoutGit = repoPath.replace(/\.git$/, '');
  
  // Extract last segment
  const parts = withoutGit.split('/');
  return parts[parts.length - 1] || 'repo';
}

/**
 * Main function to initialize workspace from GitHub repository
 * Call this at server startup
 */
export async function initializeWorkspaceFromGitHub(): Promise<GitCloneResult | null> {
  const config = getGitCloneConfigFromEnv();
  
  if (!config) {
    console.log('No GitHub repository configured (GITHUB_REPO_PATH not set)');
    return null;
  }

  console.log('='.repeat(60));
  console.log('Initializing workspace from GitHub repository...');
  console.log(`Repository: ${config.repoPath}`);
  console.log(`Target directory: ${config.workspaceDir}`);
  console.log(`Branch: ${config.branch || 'default'}`);
  console.log(`Authentication: ${config.accessToken ? 'OAuth token provided' : 'None (public repo)'}`);
  console.log('='.repeat(60));

  const result = await cloneRepository(config);
  
  if (result.success) {
    console.log(`✓ ${result.message}`);
    
    // Update working directory environment for the agent
    process.env['AGENT_WORKSPACE_DIR'] = result.workspaceDir;
  } else {
    console.error(`✗ ${result.message}`);
  }
  
  console.log('='.repeat(60));
  
  return result;
}
