#!/usr/bin/env node
import { searchArxiv } from './dist/tools/arxiv-search.js';

console.log('Testing arXiv search for "transformer efficiency"...');
const result = await searchArxiv('transformer efficiency', 5);
console.log(`Found ${result.total} papers`);
console.log(JSON.stringify(result, null, 2));
