export declare function createSkillInjectionHook(entryFileDir: string): (event: {
    toolName: string;
    params: Record<string, unknown>;
}, _ctx: {
    agentId?: string;
    sessionKey?: string;
    toolName: string;
}) => Promise<{
    params: Record<string, unknown>;
} | void>;
