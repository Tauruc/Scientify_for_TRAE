import * as os from 'os';
import { execSync } from 'child_process';
export async function detectHardware() {
    const cpuModel = os.cpus()[0].model;
    const cores = os.cpus().length / 2; // 假设超线程，物理核心是线程数的一半
    const threads = os.cpus().length;
    const totalGB = Math.round(os.totalmem() / 1024 / 1024 / 1024);
    const availableGB = Math.round(os.freemem() / 1024 / 1024 / 1024);
    let gpuInfo = {
        hasNvidia: false,
        count: 0,
        models: [],
        totalMemoryGB: [],
    };
    try {
        // 检测NVIDIA GPU
        const nvidiaSmiOutput = execSync('nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits', { encoding: 'utf8' });
        const gpus = nvidiaSmiOutput.trim().split('\n').filter(line => line);
        if (gpus.length > 0) {
            gpuInfo.hasNvidia = true;
            gpuInfo.count = gpus.length;
            for (const gpu of gpus) {
                const [name, memory] = gpu.split(',').map(s => s.trim());
                gpuInfo.models.push(name);
                gpuInfo.totalMemoryGB.push(Math.round(parseInt(memory) / 1024));
            }
        }
    }
    catch (e) {
        // 没有NVIDIA GPU
    }
    // 检测存储可用空间
    const cwd = process.cwd();
    let availableStorageGB = 0;
    try {
        if (process.platform === 'win32') {
            const drive = cwd.split(':')[0];
            // 使用 PowerShell 获取磁盘空间，避免编码问题
            const powershellOutput = execSync(`powershell -Command "(Get-PSDrive -Name '${drive}').Free"`, { encoding: 'utf8' });
            const freeBytes = parseInt(powershellOutput.trim());
            if (!isNaN(freeBytes)) {
                availableStorageGB = Math.round(freeBytes / 1024 / 1024 / 1024);
            }
        }
        else {
            const dfOutput = execSync(`df -B1G ${cwd} | tail -1`, { encoding: 'utf8' });
            const parts = dfOutput.trim().split(/\s+/);
            availableStorageGB = parseInt(parts[3]);
        }
    }
    catch (e) {
        // 忽略存储检测错误
    }
    return {
        cpu: {
            model: cpuModel,
            cores,
            threads,
        },
        memory: {
            totalGB,
            availableGB,
        },
        gpu: gpuInfo,
        storage: {
            availableGB: availableStorageGB,
        },
    };
}
export async function getOptimalExperimentConfig(hardware) {
    const config = {
        batchSize: 8,
        epochs: {
            full: 10,
            ablation: 2,
            debug: 1,
        },
        mixedPrecision: false,
        gradientAccumulationSteps: 1,
        numWorkers: 2,
        pinMemory: false,
        maxTrainSamples: 10000,
        maxValSamples: 2000,
        recommendedDevice: 'cpu',
        enableAblation: true,
        enableSupplementaryExperiments: true,
        expectedRuntimeHours: 2,
    };
    // 基础配置（仅CPU）
    if (!hardware.gpu.hasNvidia) {
        config.recommendedDevice = 'cpu';
        config.batchSize = 4;
        config.epochs.full = 5;
        config.numWorkers = Math.min(4, Math.floor(hardware.cpu.cores / 2));
        config.maxTrainSamples = 5000;
        config.maxValSamples = 1000;
        config.enableSupplementaryExperiments = false;
        config.expectedRuntimeHours = 4;
        // 内存不足时进一步限制
        if (hardware.memory.totalGB < 16) {
            config.batchSize = 2;
            config.epochs.full = 3;
            config.maxTrainSamples = 2000;
            config.enableAblation = false;
            config.expectedRuntimeHours = 6;
        }
        if (hardware.memory.totalGB < 8) {
            config.epochs.full = 2;
            config.epochs.ablation = 1;
            config.maxTrainSamples = 1000;
            config.enableAblation = false;
            config.expectedRuntimeHours = 8;
        }
        return config;
    }
    // 有NVIDIA GPU的情况
    config.recommendedDevice = 'cuda';
    config.mixedPrecision = true;
    config.pinMemory = true;
    config.numWorkers = Math.min(8, Math.floor(hardware.cpu.cores * 0.75));
    const mainGpuMemory = hardware.gpu.totalMemoryGB[0];
    // 根据显存调整batch size
    if (mainGpuMemory >= 24) {
        config.batchSize = 64;
        config.epochs.full = 30;
        config.gradientAccumulationSteps = 1;
        config.maxTrainSamples = 50000;
        config.maxValSamples = 10000;
        config.expectedRuntimeHours = 1.5;
    }
    else if (mainGpuMemory >= 16) {
        config.batchSize = 32;
        config.epochs.full = 20;
        config.gradientAccumulationSteps = 2;
        config.maxTrainSamples = 30000;
        config.maxValSamples = 5000;
        config.expectedRuntimeHours = 2;
    }
    else if (mainGpuMemory >= 12) {
        config.batchSize = 16;
        config.epochs.full = 15;
        config.gradientAccumulationSteps = 2;
        config.maxTrainSamples = 20000;
        config.maxValSamples = 3000;
        config.expectedRuntimeHours = 3;
    }
    else if (mainGpuMemory >= 8) {
        config.batchSize = 8;
        config.epochs.full = 10;
        config.gradientAccumulationSteps = 4;
        config.maxTrainSamples = 10000;
        config.maxValSamples = 2000;
        config.expectedRuntimeHours = 4;
    }
    else if (mainGpuMemory >= 6) {
        config.batchSize = 4;
        config.epochs.full = 8;
        config.gradientAccumulationSteps = 4;
        config.maxTrainSamples = 5000;
        config.maxValSamples = 1000;
        config.enableSupplementaryExperiments = false;
        config.expectedRuntimeHours = 5;
    }
    else {
        // 显存 <6GB
        config.batchSize = 2;
        config.epochs.full = 5;
        config.gradientAccumulationSteps = 8;
        config.maxTrainSamples = 2000;
        config.maxValSamples = 500;
        config.enableAblation = false;
        config.enableSupplementaryExperiments = false;
        config.expectedRuntimeHours = 6;
    }
    // 多GPU调整
    if (hardware.gpu.count > 1) {
        config.batchSize *= hardware.gpu.count;
        config.epochs.full = Math.round(config.epochs.full / hardware.gpu.count * 0.8);
        config.expectedRuntimeHours = Math.round(config.expectedRuntimeHours / hardware.gpu.count);
    }
    // 内存不足时的调整
    if (hardware.memory.totalGB < 32) {
        config.maxTrainSamples = Math.round(config.maxTrainSamples * 0.75);
        config.numWorkers = Math.max(2, config.numWorkers - 2);
    }
    if (hardware.memory.totalGB < 16) {
        config.maxTrainSamples = Math.round(config.maxTrainSamples * 0.5);
        config.numWorkers = Math.max(2, config.numWorkers - 4);
    }
    return config;
}
export async function generateHardwareReport(hardware, config) {
    let report = `# 硬件检测与实验配置报告\n\n`;
    report += `## 🖥️  硬件配置\n\n`;
    report += `**CPU:** ${hardware.cpu.model} (${hardware.cpu.cores} 核 ${hardware.cpu.threads} 线程)\n`;
    report += `**内存:** ${hardware.memory.totalGB}GB 总内存 / ${hardware.memory.availableGB}GB 可用\n`;
    if (hardware.gpu.hasNvidia) {
        report += `**GPU:** 检测到 ${hardware.gpu.count} 块NVIDIA显卡:\n`;
        for (let i = 0; i < hardware.gpu.count; i++) {
            report += `  - ${hardware.gpu.models[i]} (${hardware.gpu.totalMemoryGB[i]}GB显存)\n`;
        }
    }
    else {
        report += `**GPU:** 未检测到NVIDIA显卡，将使用CPU训练\n`;
    }
    report += `**存储:** ${hardware.storage.availableGB}GB 可用空间\n\n`;
    report += `## ⚙️  推荐实验配置\n\n`;
    report += `| 配置项 | 推荐值 |\n`;
    report += `|--------|--------|\n`;
    report += `| 训练设备 | ${config.recommendedDevice} |\n`;
    report += `| Batch Size | ${config.batchSize} |\n`;
    report += `| 完整训练epoch数 | ${config.epochs.full} |\n`;
    report += `| 消融实验epoch数 | ${config.epochs.ablation} |\n`;
    report += `| 混合精度训练 | ${config.mixedPrecision ? '✅ 启用' : '❌ 禁用'} |\n`;
    report += `| 梯度累积步数 | ${config.gradientAccumulationSteps} |\n`;
    report += `| 数据加载线程数 | ${config.numWorkers} |\n`;
    report += `| 最大训练样本数 | ${config.maxTrainSamples} |\n`;
    report += `| 最大验证样本数 | ${config.maxValSamples} |\n`;
    report += `| 启用消融实验 | ${config.enableAblation ? '✅ 是' : '❌ 否（硬件不足）'} |\n`;
    report += `| 启用补充实验 | ${config.enableSupplementaryExperiments ? '✅ 是' : '❌ 否（硬件不足）'} |\n`;
    report += `| 预计总运行时间 | ~${config.expectedRuntimeHours} 小时 |\n\n`;
    report += `## 📝 使用建议\n\n`;
    if (!hardware.gpu.hasNvidia) {
        report += `⚠️  **CPU训练警告**: 未检测到GPU，训练速度会较慢。建议减少数据规模或使用更小的模型。\n`;
        if (hardware.memory.totalGB < 16) {
            report += `⚠️  **内存不足警告**: 系统内存小于16GB，可能会出现内存不足错误，建议进一步降低batch size和样本数量。\n`;
        }
    }
    else {
        const mainGpuMemory = hardware.gpu.totalMemoryGB[0];
        if (mainGpuMemory < 8) {
            report += `⚠️  **显存不足警告**: GPU显存小于8GB，已自动禁用消融和补充实验，仅进行基础训练。\n`;
        }
        else if (mainGpuMemory < 12) {
            report += `ℹ️  **显存有限**: 已适当降低batch size和样本数量，如遇OOM错误可手动进一步降低batch size。\n`;
        }
        else {
            report += `✅  **硬件配置良好**: 可以运行完整的实验流程，包括消融实验和补充实验。\n`;
        }
    }
    if (hardware.storage.availableGB < 50) {
        report += `⚠️  **存储不足警告**: 可用存储空间小于50GB，实验过程中可能会出现磁盘空间不足。\n`;
    }
    report += `\n以上配置已针对你的硬件自动优化，可直接使用，也可根据实际情况手动调整。`;
    return report;
}
