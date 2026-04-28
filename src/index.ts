#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CoolifyMcpServer } from './lib/mcp-server.js';
import type { CoolifyConfig } from './types/coolify.js';

function parseHeaders(argv: string[]): Record<string, string> {
  const headers: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--header' && i + 1 < argv.length) {
      const value = argv[i + 1];
      const colonIndex = value.indexOf(':');
      if (colonIndex > 0) {
        headers[value.slice(0, colonIndex).trim()] = value.slice(colonIndex + 1).trim();
      }
      i++;
    }
  }
  return headers;
}

async function main(): Promise<void> {
  const customHeaders = parseHeaders(process.argv);

  const config: CoolifyConfig = {
    baseUrl: process.env.COOLIFY_BASE_URL || 'http://localhost:3000',
    accessToken: process.env.COOLIFY_ACCESS_TOKEN || '',
    customHeaders: Object.keys(customHeaders).length > 0 ? customHeaders : undefined,
  };

  if (!config.accessToken) {
    throw new Error('COOLIFY_ACCESS_TOKEN environment variable is required');
  }

  const server = new CoolifyMcpServer(config);
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
