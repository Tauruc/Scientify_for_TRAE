/**
 * Tool result helpers compatible with AgentToolResult<T>.
 *
 * AgentToolResult requires: { content: [{type:"text", text}], details: T }
 */
type ToolResultContent = {
    type: "text";
    text: string;
};
type ToolResult = {
    content: ToolResultContent[];
    details: unknown;
};
/**
 * Create a successful tool result with JSON data.
 */
export declare function ok<T extends Record<string, unknown>>(data: T): ToolResult;
/**
 * Create an error tool result.
 */
export declare function err(code: string, message: string): ToolResult;
/**
 * Create a tool result with plain text (no JSON).
 */
export declare function text(content: string): ToolResult;
/**
 * Namespace for cleaner imports: `import { Result } from "./result.js"`
 */
export declare const Result: {
    ok: typeof ok;
    err: typeof err;
    text: typeof text;
};
export {};
