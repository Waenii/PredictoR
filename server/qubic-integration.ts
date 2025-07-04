// Qubic Integration for PredictoR
// Connects existing Express API to Qubic smart contract

import { spawn } from 'child_process';

interface QubicConfig {
  nodeIp: string;
  nodePort: number;
  contractAddress: string;
  cliPath: string;
}

export class QubicIntegration {
  private config: QubicConfig;

  constructor() {
    this.config = {
      nodeIp: process.env.QUBIC_NODE_IP || '127.0.0.1',
      nodePort: parseInt(process.env.QUBIC_NODE_PORT || '31841'),
      contractAddress: process.env.QUBIC_CONTRACT_ADDRESS || '',
      cliPath: process.env.QUBIC_CLI_PATH || './qubic-tools/qubic-cli'
    };
  }

  async isQubicAvailable(): Promise<boolean> {
    try {
      const result = await this.executeCommand([
        '-nodeip', this.config.nodeIp,
        '-nodeport', this.config.nodePort.toString(),
        '-getcurrenttick'
      ]);
      return result.includes('Tick:');
    } catch {
      return false;
    }
  }

  async getUserBalance(userId: number): Promise<number | null> {
    try {
      // Call GetBalance function (index 4) with userId
      const result = await this.callContractFunction(4, { userId });
      return result?.balance || null;
    } catch {
      return null;
    }
  }

  async placeBet(userId: number, eventId: number, prediction: string, amount: number): Promise<any> {
    try {
      // Call PlaceBet function (index 2)
      const result = await this.callContractFunction(2, {
        userId,
        eventId,
        prediction: prediction === 'YES' ? 1 : 0,
        amount
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getEvents(): Promise<any[]> {
    try {
      // Call GetEvents function (index 5)
      const result = await this.callContractFunction(5, { startIndex: 0, count: 100 });
      return result?.events || [];
    } catch {
      return [];
    }
  }

  async resolveEvent(eventId: number, correctAnswer: string, confidence: number): Promise<void> {
    try {
      // Call ResolveEvent function (index 3)
      await this.callContractFunction(3, {
        eventId,
        correctAnswer: correctAnswer === 'YES' ? 1 : 0,
        confidence
      });
    } catch (error) {
      throw error;
    }
  }

  private async executeCommand(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const cli = spawn(this.config.cliPath, args);
      let stdout = '';
      let stderr = '';

      cli.stdout.on('data', (data) => stdout += data.toString());
      cli.stderr.on('data', (data) => stderr += data.toString());

      cli.on('close', (code) => {
        if (code === 0) resolve(stdout);
        else reject(new Error(stderr));
      });
    });
  }

  private async callContractFunction(functionIndex: number, inputData: any): Promise<any> {
    // Simplified contract function call
    // In production, this would properly serialize input data
    const args = [
      '-nodeip', this.config.nodeIp,
      '-nodeport', this.config.nodePort.toString(),
      '-requestcontractfunction',
      this.config.contractAddress,
      functionIndex.toString(),
      JSON.stringify(inputData)
    ];

    const result = await this.executeCommand(args);
    return JSON.parse(result);
  }

  // Status and debugging methods
  async getCurrentTick(): Promise<number> {
    try {
      const result = await this.executeCommand([
        '-nodeip', this.config.nodeIp,
        '-nodeport', this.config.nodePort.toString(),
        '-getcurrenttick'
      ]);
      const match = result.match(/Tick: (\d+)/);
      return match ? parseInt(match[1]) : 0;
    } catch {
      return 0;
    }
  }

  getConfig() {
    return {
      nodeIp: this.config.nodeIp,
      nodePort: this.config.nodePort,
      contractAddress: this.config.contractAddress,
      cliPath: this.config.cliPath
    };
  }
}