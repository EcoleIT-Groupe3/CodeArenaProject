const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const execAsync = promisify(exec);

class CodeExecutionService {
  static TIMEOUT = 10000;
  static MEMORY_LIMIT = '256m';
  static CPU_LIMIT = '0.5';

  static LANGUAGE_CONFIG = {
    python: {
      image: 'codearena-sandbox-python',
      extension: 'py',
      command: (file) => `python3 ${file}`
    }
  };

  static async executeCode(code, language, testCases) {
    const config = this.LANGUAGE_CONFIG[language];
    if (!config) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const executionId = crypto.randomBytes(16).toString('hex');
    const fileName = `code_${executionId}.${config.extension}`;
    const results = [];

    try {
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const result = await this.runTestCase(code, language, config, fileName, testCase, i);
        results.push(result);

        if (!result.passed) {
          break;
        }
      }

      const allPassed = results.every(r => r.passed);
      const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
      const avgMemoryUsed = results.reduce((sum, r) => sum + r.memoryUsed, 0) / results.length;

      return {
        status: allPassed ? 'accepted' : 'rejected',
        results,
        executionTime: Math.round(avgExecutionTime),
        memoryUsed: Math.round(avgMemoryUsed),
        error: allPassed ? null : 'Test case failed'
      };
    } catch (error) {
      return {
        status: 'error',
        results,
        executionTime: 0,
        memoryUsed: 0,
        error: error.message
      };
    }
  }

  static async runTestCase(code, language, config, fileName, testCase, index) {
    const startTime = Date.now();
    const containerId = `sandbox_${Date.now()}_${index}`;

    try {
      const dockerCommand = [
        'docker run',
        '--name', containerId,
        '--rm',
        '--network none',
        `--memory=${this.MEMORY_LIMIT}`,
        `--cpus=${this.CPU_LIMIT}`,
        '--pids-limit=50',
        '--ulimit nofile=100:100',
        '--ulimit nproc=50:50',
        '--read-only',
        '--tmpfs /tmp:rw,noexec,nosuid,size=50m',
        '-v', `${process.cwd()}/sandbox_tmp:/sandbox:ro`,
        config.image,
        'sh', '-c',
        `"echo '${this.escapeCode(code)}' > /tmp/${fileName} && cd /tmp && ${config.command(fileName)}"`
      ].join(' ');

      const { stdout, stderr } = await execAsync(dockerCommand, {
        timeout: this.TIMEOUT,
        maxBuffer: 1024 * 1024,
        input: testCase.input || ''
      });

      const executionTime = Date.now() - startTime;
      const output = stdout.trim();
      const expectedOutput = testCase.output.trim();
      const passed = output === expectedOutput;

      const memoryStats = await this.getContainerMemory(containerId).catch(() => 10);

      return {
        testCase: index + 1,
        passed,
        input: testCase.input,
        expectedOutput,
        actualOutput: output,
        executionTime,
        memoryUsed: memoryStats,
        error: stderr ? stderr.substring(0, 500) : null
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      if (error.killed || error.signal === 'SIGTERM') {
        return {
          testCase: index + 1,
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: '',
          executionTime: this.TIMEOUT,
          memoryUsed: 0,
          error: 'Time Limit Exceeded'
        };
      }

      return {
        testCase: index + 1,
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: '',
        executionTime,
        memoryUsed: 0,
        error: error.message.substring(0, 500)
      };
    } finally {
      await this.cleanupContainer(containerId).catch(() => {});
    }
  }

  static async getContainerMemory(containerId) {
    try {
      const { stdout } = await execAsync(
        `docker stats ${containerId} --no-stream --format "{{.MemUsage}}"`,
        { timeout: 1000 }
      );
      const memMatch = stdout.match(/([0-9.]+)MiB/);
      return memMatch ? parseFloat(memMatch[1]) : 10;
    } catch {
      return 10;
    }
  }

  static async cleanupContainer(containerId) {
    try {
      await execAsync(`docker rm -f ${containerId}`, { timeout: 5000 });
    } catch {
    }
  }

  static escapeCode(code) {
    return code
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "'\\''")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\$/g, '\\$')
      .replace(/`/g, '\\`');
  }

  static async buildImages() {
    const sandboxDir = path.join(process.cwd(), 'sandbox');

    console.log('Building Docker sandbox image...');

    try {
      const dockerfilePath = path.join(sandboxDir, 'Dockerfile.python');
      const imageName = 'codearena-sandbox-python';

      console.log(`Building ${imageName}...`);

      await execAsync(
        `docker build -f ${dockerfilePath} -t ${imageName} ${sandboxDir}`,
        { timeout: 300000 }
      );

      console.log(`✓ ${imageName} built successfully`);
    } catch (error) {
      console.error(`✗ Failed to build Python image:`, error.message);
    }

    console.log('Docker sandbox image ready');
  }
}

module.exports = CodeExecutionService;
