/**
 * Tool result helpers compatible with AgentToolResult<T>.
 *
 * AgentToolResult requires: { content: [{type:"text", text}], details: T }
 */
/**
 * Create a successful tool result with JSON data.
 */
export function ok(data) {
    return {
        content: [{ type: "text", text: JSON.stringify(data) }],
        details: data,
    };
}
/**
 * Create an error tool result.
 */
export function err(code, message) {
    return {
        content: [{ type: "text", text: JSON.stringify({ error: code, message }) }],
        details: { error: code, message },
    };
}
/**
 * Create a tool result with plain text (no JSON).
 */
export function text(content) {
    return {
        content: [{ type: "text", text: content }],
        details: null,
    };
}
/**
 * Namespace for cleaner imports: `import { Result } from "./result.js"`
 */
export const Result = { ok, err, text };
