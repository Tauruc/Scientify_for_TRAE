import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
const OPENCLAW_HOME = path.join(os.homedir(), ".openclaw");
/**
 * Find the research project workspace for the current agent context.
 * In a Feishu group bound to a project agent, the workspace is at
 * ~/.openclaw/workspace-research-{id}/
 */
function findProjectWorkspace() {
    // Read openclaw.json to find research agents
    const configPath = path.join(OPENCLAW_HOME, "openclaw.json");
    let config;
    try {
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    catch {
        return null;
    }
    const agents = config.agents?.list ?? [];
    const researchAgents = agents.filter((a) => a.id.startsWith("research-"));
    // Try each research agent workspace to find one with config.json
    for (const agent of researchAgents) {
        const workspace = (agent.workspace ?? `~/.openclaw/workspace-${agent.id}`).replace("~", os.homedir());
        const metabolismConfig = path.join(workspace, "config.json");
        if (fs.existsSync(metabolismConfig)) {
            return { workspace, projectId: agent.id.replace("research-", "") };
        }
    }
    // If only one research agent, use it even without config.json (pre-bootstrap)
    if (researchAgents.length === 1) {
        const agent = researchAgents[0];
        const workspace = (agent.workspace ?? `~/.openclaw/workspace-${agent.id}`).replace("~", os.homedir());
        return { workspace, projectId: agent.id.replace("research-", "") };
    }
    return null;
}
function readMetabolismConfig(workspace) {
    try {
        return JSON.parse(fs.readFileSync(path.join(workspace, "config.json"), "utf-8"));
    }
    catch {
        return null;
    }
}
function countFiles(dirPath, filter) {
    try {
        const entries = fs.readdirSync(dirPath);
        return filter ? entries.filter(filter).length : entries.length;
    }
    catch {
        return 0;
    }
}
/**
 * /metabolism-status — Show knowledge metabolism status
 */
export function handleMetabolismStatus(_ctx) {
    const project = findProjectWorkspace();
    if (!project) {
        return { text: "No research project found. Use `openclaw research init <id>` to create one." };
    }
    const { workspace, projectId } = project;
    const config = readMetabolismConfig(workspace);
    const topicCount = countFiles(path.join(workspace, "knowledge"), (f) => f.startsWith("topic-"));
    const hypothesisCount = countFiles(path.join(workspace, "ideas"), (f) => f.endsWith(".md"));
    let output = `**Metabolism Status — ${projectId}**\n\n`;
    if (!config) {
        output += "Status: Pending BOOTSTRAP configuration\n";
        output += "Send a message in this group to start the configuration flow.\n";
        return { text: output };
    }
    const heartbeatStatus = config.heartbeat?.enabled !== false ? "active" : "paused";
    output += `Day: ${config.currentDay}\n`;
    output += `Topics: ${topicCount}\n`;
    output += `Hypotheses: ${hypothesisCount}\n`;
    output += `Heartbeat: ${heartbeatStatus}\n`;
    return { text: output };
}
