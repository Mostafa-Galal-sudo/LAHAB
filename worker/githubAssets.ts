import type { Env } from './types';

export interface GitHubAssetConfig {
  repository: string;
  branch: string;
  token: string;
}

interface GitHubContentResponse {
  content?: {
    sha?: string;
    download_url?: string;
    html_url?: string;
  };
}

export class GitHubAssetError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'GitHubAssetError';
  }
}

const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const BRANCH = /^[A-Za-z0-9._/-]{1,200}$/;

export function getGitHubAssetConfig(env: Env): GitHubAssetConfig | null {
  const repository = env.GITHUB_ASSET_REPOSITORY?.trim();
  const branch = env.GITHUB_ASSET_BRANCH?.trim() || 'main';
  const token = env.GITHUB_ASSET_TOKEN?.trim();
  if (!repository || !token || !REPOSITORY.test(repository) || !BRANCH.test(branch) || branch.includes('..')) return null;
  return { repository, branch, token };
}

function encodeRepositoryPath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function apiUrl(config: GitHubAssetConfig, path: string) {
  return `https://api.github.com/repos/${config.repository}/contents/${encodeRepositoryPath(path)}`;
}

function headers(config: GitHubAssetConfig) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${config.token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'LAHAB-Asset-Manager',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function toBase64(bytes: Uint8Array) {
  const chunks: string[] = [];
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + chunkSize)));
  }
  return btoa(chunks.join(''));
}

async function githubError(response: Response, operation: string): Promise<never> {
  let detail = '';
  try {
    const payload = await response.json<{ message?: string }>();
    detail = payload.message ? ` ${payload.message}` : '';
  } catch {
    // GitHub may return an empty gateway response; the status remains useful.
  }
  throw new GitHubAssetError(`GitHub ${operation} failed (${response.status}).${detail}`, response.status);
}

export async function createGitHubAsset(
  config: GitHubAssetConfig,
  path: string,
  bytes: Uint8Array,
  commitLabel: string,
) {
  const response = await fetch(apiUrl(config, path), {
    method: 'PUT',
    headers: headers(config),
    body: JSON.stringify({
      message: `assets: add ${commitLabel}`,
      content: toBase64(bytes),
      branch: config.branch,
    }),
  });
  if (!response.ok) return githubError(response, 'upload');
  const payload = await response.json<GitHubContentResponse>();
  if (!payload.content?.sha || !payload.content.download_url) {
    throw new GitHubAssetError('GitHub upload completed without usable asset metadata.', 502);
  }
  return {
    sha: payload.content.sha,
    downloadUrl: payload.content.download_url,
    htmlUrl: payload.content.html_url ?? null,
  };
}

export async function deleteGitHubAsset(config: GitHubAssetConfig, path: string, knownSha?: string) {
  let sha = knownSha;
  if (!sha) {
    const lookup = await fetch(`${apiUrl(config, path)}?ref=${encodeURIComponent(config.branch)}`, {
      headers: headers(config),
    });
    if (!lookup.ok) return githubError(lookup, 'lookup');
    const payload = await lookup.json<{ sha?: string }>();
    sha = payload.sha;
  }
  if (!sha) throw new GitHubAssetError('GitHub asset SHA is unavailable.', 502);

  const response = await fetch(apiUrl(config, path), {
    method: 'DELETE',
    headers: headers(config),
    body: JSON.stringify({ message: `assets: remove ${path.split('/').pop()}`, sha, branch: config.branch }),
  });
  if (!response.ok) return githubError(response, 'delete');
}
