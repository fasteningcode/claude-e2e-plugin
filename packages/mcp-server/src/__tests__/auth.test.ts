import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { getGitHubToken, parseRepoUrl } from '../auth/github.js';

describe('getGitHubToken', () => {
  const originalEnv = process.env['GITHUB_TOKEN'];

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env['GITHUB_TOKEN'];
    } else {
      process.env['GITHUB_TOKEN'] = originalEnv;
    }
  });

  it('returns token from environment', () => {
    process.env['GITHUB_TOKEN'] = 'ghp_test123';
    expect(getGitHubToken()).toBe('ghp_test123');
  });

  it('throws when GITHUB_TOKEN is not set', () => {
    delete process.env['GITHUB_TOKEN'];
    expect(() => getGitHubToken()).toThrow('GITHUB_TOKEN environment variable is required');
  });
});

describe('parseRepoUrl', () => {
  it('parses standard GitHub URL', () => {
    expect(parseRepoUrl('https://github.com/acme/my-app')).toEqual({
      owner: 'acme',
      repo: 'my-app',
    });
  });

  it('strips .git suffix', () => {
    expect(parseRepoUrl('https://github.com/acme/my-app.git')).toEqual({
      owner: 'acme',
      repo: 'my-app',
    });
  });

  it('throws when owner is missing', () => {
    expect(() => parseRepoUrl('https://github.com/')).toThrow('Invalid GitHub repository URL');
  });

  it('throws when repo is missing', () => {
    expect(() => parseRepoUrl('https://github.com/acme')).toThrow('Invalid GitHub repository URL');
  });
});
