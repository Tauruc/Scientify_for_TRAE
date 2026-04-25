#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { searchArxiv, searchOpenAlex, downloadPaper } from './tools/index.js';
import type { Paper } from './types.js';

const server = new Server(
  {
    name: 'scientify-tools',
    version: '3.2.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'arxiv_search',
        description: 'Search arXiv papers by query. Returns paper metadata including arXiv ID, title, authors, abstract, and PDF links.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { 
              type: 'string', 
              description: 'Search query (e.g., "transformer efficiency" or "long context LLM")' 
            },
            max_results: { 
              type: 'number', 
              description: 'Maximum number of results to return (default: 30)',
              default: 30
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'openalex_search',
        description: 'Search OpenAlex papers by query. Broader coverage across multiple academic disciplines.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { 
              type: 'string', 
              description: 'Search query (e.g., "neural architecture search")' 
            },
            max_results: { 
              type: 'number', 
              description: 'Maximum number of results to return (default: 20)',
              default: 20
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'paper_download',
        description: 'Download a paper by arXiv ID or DOI. Prefers .tex source for arXiv papers, falls back to PDF.',
        inputSchema: {
          type: 'object',
          properties: {
            arxiv_id: { 
              type: 'string', 
              description: 'arXiv ID (e.g., "2310.06825" or "2401.12345")' 
            },
            doi: { 
              type: 'string', 
              description: 'DOI (e.g., "10.1000/xyz123")' 
            },
            target_dir: { 
              type: 'string', 
              description: 'Target directory for downloaded paper (default: "papers")',
              default: 'papers'
            },
          },
          required: [],
        },
      },
      {
        name: 'detect_hardware',
        description: 'Detect local hardware configuration (CPU, GPU, memory, storage) and recommend optimal experiment settings.',
        inputSchema: {
          type: 'object',
          properties: {
            verbose: { 
              type: 'boolean', 
              description: 'Return detailed hardware report (default: false)',
              default: false
            },
          },
          required: [],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'arxiv_search') {
      const { query, max_results = 30 } = args as { query: string; max_results?: number };
      const result = await searchArxiv(query, max_results);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === 'openalex_search') {
      const { query, max_results = 20 } = args as { query: string; max_results?: number };
      const result = await searchOpenAlex(query, max_results);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === 'paper_download') {
      const { arxiv_id, doi, target_dir = 'papers' } = args as { 
        arxiv_id?: string; 
        doi?: string; 
        target_dir?: string 
      };
      
      if (!arxiv_id && !doi) {
        throw new Error('Either arxiv_id or doi must be provided');
      }
      
      const paper: Paper = {
        id: arxiv_id || doi!,
        title: '',
        authors: [],
        arxivId: arxiv_id,
        doi,
      };
      
      const path = await downloadPaper(paper, target_dir);
      return {
        content: [
          {
            type: 'text',
            text: path ? `Successfully downloaded to: ${path}` : 'Download failed: Unable to retrieve paper',
          },
        ],
      };
    }

    if (name === 'detect_hardware') {
      const { verbose = false } = args as { verbose?: boolean };
      const { detectHardware, getOptimalExperimentConfig, generateHardwareReport } = await import('./tools/hardware-check.js');
      
      const hardware = await detectHardware();
      
      if (verbose) {
        const config = await getOptimalExperimentConfig(hardware);
        const report = await generateHardwareReport(hardware, config);
        return {
          content: [
            {
              type: 'text',
              text: report,
            },
          ],
        };
      } else {
        const config = getOptimalExperimentConfig(hardware);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                hardware: {
                  cpu: hardware.cpu,
                  gpu: hardware.gpu,
                  memory: hardware.memory,
                },
                recommended_config: config,
              }, null, 2),
            },
          ],
        };
      }
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Scientify MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in MCP Server:', error);
  process.exit(1);
});
