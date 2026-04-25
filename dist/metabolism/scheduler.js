import { runDailyHeartbeat } from './heartbeat.js';
let heartbeatInterval = null;
export function startScheduler(workdir, intervalHours = 24) {
    if (heartbeatInterval) {
        console.log('Scheduler already running');
        return;
    }
    console.log(`Starting metabolism scheduler, running every ${intervalHours} hours`);
    runDailyHeartbeat(workdir).catch(console.error);
    heartbeatInterval = setInterval(() => {
        runDailyHeartbeat(workdir).catch(console.error);
    }, intervalHours * 60 * 60 * 1000);
}
export function stopScheduler() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
        console.log('Scheduler stopped');
    }
}
