// Qubic Bridge Server
// Connects web frontend to Qubic smart contract

import { spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

export interface QubicConfig {
  nodeIp: string;
  nodePort: number;
  contractAddress: string;
  cliPath: string;
  privateKey?: string;
}

export interface QubicTransaction {
  id: string;
  status: 'pending' | 'confirmed' | 'failed';
  hash?: string;
  error?: string;
  result?: any;
}

export interface QubicUser {
  id: number;
  username: string;
  balance: number;
  totalBets: number;
  totalWins: number;
}

export interface QubicEvent {
  id: number;
  title: string;
  description: string;
  category: string;
  createdAt: Date;
  endsAt: Date;
  isActive: boolean;
  isResolved: boolean;
  correctAnswer?: 'YES' | 'NO';
  totalBets: number;
  yesBets: number;
  noBets: number;
}

export interface QubicBet {
  id: number;
  userId: number;
  eventId: number;
  prediction: 'YES' | 'NO';
  amount: number;
  createdAt: Date;
  isWon?: boolean;
  isProcessed: boolean;
}

export class QubicError extends Error {
  constructor(
    message: string,
    public code: string,
    public qubicError?: any
  ) {
    super(message);
    this.name = 'QubicError';
  }
}

export enum QubicErrorCodes {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INVALID_EVENT = 'INVALID_EVENT',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED'
}

export class QubicBridge {
  private config: QubicConfig;
  private transactions: Map<string, QubicTransaction> = new Map();

  constructor(config: QubicConfig) {
    this.config = config;
  }

  // Execute Qubic CLI command
  private async executeCommand(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const cli = spawn(this.config.cliPath, args);
      let stdout = '';
      let stderr = '';

      cli.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      cli.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      cli.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new QubicError(
            `CLI command failed: ${stderr}`,
            QubicErrorCodes.NETWORK_ERROR,
            { code, stderr }
          ));
        }
      });

      cli.on('error', (error) => {
        reject(new QubicError(
          `Failed to execute CLI: ${error.message}`,
          QubicErrorCodes.NETWORK_ERROR,
          error
        ));
      });
    });
  }

  // Call contract function (read-only)
  async callContractFunction(functionIndex: number, inputData: any): Promise<any> {
    try {
      const serializedInput = this.serializeInput(inputData);
      const args = [
        '-nodeip', this.config.nodeIp,
        '-nodeport', this.config.nodePort.toString(),
        '-requestcontractfunction',
        this.config.contractAddress,
        functionIndex.toString(),
        serializedInput
      ];

      const result = await this.executeCommand(args);
      return this.parseOutput(result);
    } catch (error) {
      throw new QubicError(
        `Contract function call failed: ${error.message}`,
        QubicErrorCodes.CONTRACT_ERROR,
        error
      );
    }
  }

  // Submit transaction to contract
  async submitTransaction(functionIndex: number, inputData: any, amount = 0): Promise<QubicTransaction> {
    const transactionId = this.generateTransactionId();
    
    try {
      const transaction: QubicTransaction = {
        id: transactionId,
        status: 'pending'
      };
      
      this.transactions.set(transactionId, transaction);

      const serializedInput = this.serializeInput(inputData);
      const args = [
        '-nodeip', this.config.nodeIp,
        '-nodeport', this.config.nodePort.toString(),
        '-sendtransaction',
        this.config.contractAddress,
        functionIndex.toString(),
        amount.toString(),
        serializedInput
      ];

      if (this.config.privateKey) {
        args.push('-privatekey', this.config.privateKey);
      }

      const result = await this.executeCommand(args);
      const parsedResult = this.parseTransactionResult(result);

      transaction.status = 'confirmed';
      transaction.hash = parsedResult.hash;
      transaction.result = parsedResult.data;

      return transaction;
    } catch (error) {
      const transaction = this.transactions.get(transactionId);
      if (transaction) {
        transaction.status = 'failed';
        transaction.error = error.message;
      }
      
      throw new QubicError(
        `Transaction submission failed: ${error.message}`,
        QubicErrorCodes.TRANSACTION_FAILED,
        error
      );
    }
  }

  // User Management Functions

  async registerUser(username: string, password: string): Promise<QubicUser> {
    const inputData = {
      username: this.stringToBytes32(username),
      password: this.stringToBytes32(password) // Should be hashed
    };

    const transaction = await this.submitTransaction(0, inputData);
    
    if (transaction.status === 'confirmed' && transaction.result?.success) {
      return {
        id: transaction.result.userId,
        username,
        balance: transaction.result.balance,
        totalBets: 0,
        totalWins: 0
      };
    }

    throw new QubicError(
      'User registration failed',
      QubicErrorCodes.CONTRACT_ERROR,
      transaction.error
    );
  }

  async getUserBalance(userId: number): Promise<number> {
    const inputData = { userId };
    const result = await this.callContractFunction(4, inputData);
    
    if (result?.success) {
      return result.balance;
    }

    throw new QubicError(
      'Failed to get user balance',
      QubicErrorCodes.CONTRACT_ERROR
    );
  }

  // Event Management Functions

  async createEvent(
    title: string,
    description: string,
    category: string,
    endsAt: Date
  ): Promise<QubicEvent> {
    const inputData = {
      title: this.stringToBytes128(title),
      description: this.stringToBytes256(description),
      category: this.stringToBytes32(category),
      endsAt: Math.floor(endsAt.getTime() / 1000)
    };

    const transaction = await this.submitTransaction(2, inputData);
    
    if (transaction.status === 'confirmed' && transaction.result?.success) {
      return {
        id: transaction.result.eventId,
        title,
        description,
        category,
        createdAt: new Date(),
        endsAt,
        isActive: true,
        isResolved: false,
        totalBets: 0,
        yesBets: 0,
        noBets: 0
      };
    }

    throw new QubicError(
      'Event creation failed',
      QubicErrorCodes.CONTRACT_ERROR,
      transaction.error
    );
  }

  async getActiveEvents(): Promise<QubicEvent[]> {
    const inputData = { startIndex: 0, count: 100 };
    const result = await this.callContractFunction(5, inputData);
    
    if (result?.success) {
      // Note: This is simplified - in real implementation you'd need to
      // iterate through events and parse each one
      return [];
    }

    throw new QubicError(
      'Failed to get events',
      QubicErrorCodes.CONTRACT_ERROR
    );
  }

  async resolveEvent(eventId: number, correctAnswer: 'YES' | 'NO', confidence: number): Promise<void> {
    const inputData = {
      eventId,
      correctAnswer: correctAnswer === 'YES' ? 1 : 0,
      confidence: Math.min(100, Math.max(0, confidence))
    };

    const transaction = await this.submitTransaction(3, inputData);
    
    if (transaction.status !== 'confirmed' || !transaction.result?.success) {
      throw new QubicError(
        'Event resolution failed',
        QubicErrorCodes.CONTRACT_ERROR,
        transaction.error
      );
    }
  }

  // Betting Functions

  async placeBet(
    userId: number,
    eventId: number,
    prediction: 'YES' | 'NO',
    amount: number
  ): Promise<QubicBet> {
    const inputData = {
      userId,
      eventId,
      prediction: prediction === 'YES' ? 1 : 0,
      amount
    };

    const transaction = await this.submitTransaction(1, inputData);
    
    if (transaction.status === 'confirmed' && transaction.result?.success) {
      return {
        id: transaction.result.betId,
        userId,
        eventId,
        prediction,
        amount,
        createdAt: new Date(),
        isProcessed: false
      };
    }

    throw new QubicError(
      'Bet placement failed',
      QubicErrorCodes.TRANSACTION_FAILED,
      transaction.error
    );
  }

  async getUserBets(userId: number): Promise<QubicBet[]> {
    const inputData = { userId };
    const result = await this.callContractFunction(6, inputData);
    
    if (result?.success) {
      // Note: This is simplified - in real implementation you'd need to
      // parse the bet data from the contract
      return [];
    }

    throw new QubicError(
      'Failed to get user bets',
      QubicErrorCodes.CONTRACT_ERROR
    );
  }

  // Utility Functions

  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private serializeInput(data: any): string {
    // Convert input data to hex string format expected by Qubic CLI
    // This is a simplified version - real implementation would need proper serialization
    return Buffer.from(JSON.stringify(data)).toString('hex');
  }

  private parseOutput(output: string): any {
    try {
      // Parse Qubic CLI output format
      // This is simplified - real implementation would parse binary data
      const lines = output.split('\n');
      const resultLine = lines.find(line => line.includes('Result:'));
      
      if (resultLine) {
        return JSON.parse(resultLine.replace('Result:', '').trim());
      }
      
      return null;
    } catch (error) {
      throw new QubicError(
        'Failed to parse contract output',
        QubicErrorCodes.CONTRACT_ERROR,
        error
      );
    }
  }

  private parseTransactionResult(output: string): { hash: string; data: any } {
    try {
      const lines = output.split('\n');
      const hashLine = lines.find(line => line.includes('Transaction Hash:'));
      const resultLine = lines.find(line => line.includes('Result:'));
      
      return {
        hash: hashLine ? hashLine.split(':')[1].trim() : '',
        data: resultLine ? JSON.parse(resultLine.split(':')[1].trim()) : null
      };
    } catch (error) {
      throw new QubicError(
        'Failed to parse transaction result',
        QubicErrorCodes.CONTRACT_ERROR,
        error
      );
    }
  }

  private stringToBytes32(str: string): number[] {
    const bytes = Buffer.from(str.substring(0, 32), 'utf8');
    const result = new Array(32).fill(0);
    bytes.copy(Buffer.from(result), 0);
    return result;
  }

  private stringToBytes128(str: string): number[] {
    const bytes = Buffer.from(str.substring(0, 128), 'utf8');
    const result = new Array(128).fill(0);
    bytes.copy(Buffer.from(result), 0);
    return result;
  }

  private stringToBytes256(str: string): number[] {
    const bytes = Buffer.from(str.substring(0, 256), 'utf8');
    const result = new Array(256).fill(0);
    bytes.copy(Buffer.from(result), 0);
    return result;
  }

  // Status Functions

  async getTransactionStatus(transactionId: string): Promise<QubicTransaction | null> {
    return this.transactions.get(transactionId) || null;
  }

  async getCurrentTick(): Promise<number> {
    const args = [
      '-nodeip', this.config.nodeIp,
      '-nodeport', this.config.nodePort.toString(),
      '-getcurrenttick'
    ];

    const result = await this.executeCommand(args);
    const match = result.match(/Tick: (\d+)/);
    
    return match ? parseInt(match[1]) : 0;
  }

  async getContractBalance(): Promise<number> {
    const args = [
      '-nodeip', this.config.nodeIp,
      '-nodeport', this.config.nodePort.toString(),
      '-getbalance',
      this.config.contractAddress
    ];

    const result = await this.executeCommand(args);
    const match = result.match(/Balance: (\d+)/);
    
    return match ? parseInt(match[1]) : 0;
  }
}