/**
 * Hook for injecting SKILL.md content into cron session messages.
 *
 * When a cron job fires with a heartbeat message starting with `/skill-name`,
 * this hook reads the matching SKILL.md from the agent's workspace and
 * prepends its body via prependContext, so the agent receives full workflow
 * instructions in the isolated cron session.
 */
export declare function createCronSkillInjectionHook(): (event: {
    prompt?: string;
    messages?: unknown[];
    [key: string]: unknown;
}, ctx: {
    trigger?: string;
    workspaceDir?: string;
    [key: string]: unknown;
}) => Promise<{
    prependContext: string;
} | void>;
