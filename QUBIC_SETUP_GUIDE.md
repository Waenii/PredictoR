# PredictoR Qubic Integration Setup Guide

This guide walks you through setting up the hybrid PredictoR system with Qubic Network smart contracts.

## Prerequisites

1. **Node.js & NPM**: Already installed in your project
2. **Qubic CLI**: Download from [qubic/qubic-cli](https://github.com/qubic/qubic-cli)
3. **Qubic Development Access**: Contact Qubic team for testnet access
4. **Groq API Key**: Already configured in your project

## Phase 1: Smart Contract Development

### 1.1 Fork Qubic Core Repository

```bash
# Clone the Qubic core repository
git clone https://github.com/qubic/core.git qubic-core
cd qubic-core

# Switch to the hackathon branch
git checkout madrid-2025

# Create your own branch
git checkout -b predictor-integration
```

### 1.2 Replace Template with PredictoR Contract

```bash
# Copy the PredictoR smart contract
cp ../qubic-contracts/PredictoR.h src/contracts/HM25.h

# Verify the contract is in place
ls -la src/contracts/HM25.h
```

### 1.3 Build and Test Smart Contract

```bash
# Build the contract (follow Qubic build instructions)
make clean && make

# Test basic compilation
# (Specific build commands depend on Qubic's build system)
```

## Phase 2: Testnet Deployment

### 2.1 Get Testnet Access

1. Join Qubic Discord: [discord.gg/qubic](https://discord.gg/qubic)
2. Request testnet node access in #dev channel
3. Get your dedicated testnet IP address and credentials

### 2.2 Deploy to Testnet

```bash
# Connect to your testnet node via SSH
ssh root@<your-testnet-ip>

# Navigate to deployment directory
cd /root/qubic/qubic-docker

# Deploy your fork
./deploy.sh https://github.com/<your-username>/core/tree/predictor-integration

# Wait for deployment to complete
# Note: This process can take 10-30 minutes
```

### 2.3 Verify Deployment

```bash
# Test node connectivity
./qubic-cli -nodeip <your-testnet-ip> -nodeport 31841 -getcurrenttick

# Should return current tick information
# Example output:
# Tick: 21190235
# Epoch: 152
# ...
```

## Phase 3: Bridge Server Setup

### 3.1 Install Dependencies

```bash
# In your PredictoR project root
npm install child_process util

# Add Qubic CLI to your project (download appropriate binary)
mkdir qubic-tools
cd qubic-tools

# Download Qubic CLI for your platform
# Linux:
wget https://github.com/qubic/qubic-cli/releases/latest/download/qubic-cli-linux
chmod +x qubic-cli-linux

# macOS:
wget https://github.com/qubic/qubic-cli/releases/latest/download/qubic-cli-macos
chmod +x qubic-cli-macos

# Windows:
# Download qubic-cli-windows.exe
```

### 3.2 Configure Environment Variables

```bash
# Add to your .env file
echo "QUBIC_NODE_IP=<your-testnet-ip>" >> .env
echo "QUBIC_NODE_PORT=31841" >> .env
echo "QUBIC_CONTRACT_ADDRESS=<your-contract-address>" >> .env
echo "QUBIC_CLI_PATH=./qubic-tools/qubic-cli-linux" >> .env
echo "QUBIC_PRIVATE_KEY=<your-private-key>" >> .env
```

### 3.3 Integrate Bridge with Express Server

Update your `server/index.ts`:

```typescript
import express from 'express';
import qubicRoutes from '../qubic-bridge/qubic-routes';
import { registerRoutes } from './routes';

const app = express();

// Add Qubic routes
app.use('/api', qubicRoutes);

// Keep existing routes as fallback
registerRoutes(app);

export default app;
```

## Phase 4: Frontend Updates

### 4.1 Add Qubic Status Component

Create `client/src/components/qubic-status.tsx`:

```typescript
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

export function QubicStatus() {
  const { data: status } = useQuery({
    queryKey: ['/api/qubic/status'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  return (
    <div className="flex items-center gap-2 text-sm">
      <Badge variant={status?.connected ? 'default' : 'destructive'}>
        {status?.connected ? 'Qubic Connected' : 'Qubic Disconnected'}
      </Badge>
      {status?.connected && (
        <span className="text-muted-foreground">
          Tick: {status.currentTick}
        </span>
      )}
    </div>
  );
}
```

### 4.2 Add Transaction Status Modal

Create `client/src/components/transaction-status.tsx`:

```typescript
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface TransactionStatusProps {
  transactionId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionStatus({ transactionId, isOpen, onClose }: TransactionStatusProps) {
  const { data: transaction } = useQuery({
    queryKey: ['/api/qubic/transaction', transactionId],
    enabled: !!transactionId && isOpen,
    refetchInterval: 2000
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction Status</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {transaction?.status === 'pending' && <Loader2 className="h-4 w-4 animate-spin" />}
            {transaction?.status === 'confirmed' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {transaction?.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
            
            <Badge variant={
              transaction?.status === 'confirmed' ? 'default' :
              transaction?.status === 'failed' ? 'destructive' : 'secondary'
            }>
              {transaction?.status || 'Unknown'}
            </Badge>
          </div>
          
          {transaction?.hash && (
            <div>
              <label className="text-sm font-medium">Transaction Hash:</label>
              <p className="text-sm font-mono break-all">{transaction.hash}</p>
            </div>
          )}
          
          {transaction?.error && (
            <div>
              <label className="text-sm font-medium text-red-500">Error:</label>
              <p className="text-sm">{transaction.error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 4.3 Update Home Page

Add Qubic status to your home page:

```typescript
// In client/src/pages/home.tsx
import { QubicStatus } from '@/components/qubic-status';

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1>PredictoR</h1>
        <QubicStatus />
      </div>
      
      {/* Rest of your existing home page */}
    </div>
  );
}
```

## Phase 5: Testing & Validation

### 5.1 Test Smart Contract Functions

```bash
# Test contract deployment
curl http://localhost:5000/api/qubic/status

# Test user registration
curl -X POST http://localhost:5000/api/qubic/user/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'

# Test event creation (if admin)
curl -X POST http://localhost:5000/api/qubic/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "Test Description",
    "category": "Test",
    "endsAt": "2025-12-31T23:59:59Z"
  }'

# Test betting
curl -X POST http://localhost:5000/api/bets \
  -H "Content-Type: application/json" \
  -d '{"eventId": 1, "prediction": "YES", "amount": 10}'
```

### 5.2 Monitor Logs

```bash
# Check your application logs
npm run dev

# Monitor Qubic node logs (via SSH)
ssh root@<your-testnet-ip>
tail -f /root/qubic/qubic-docker/logs/qubic.log
```

### 5.3 Verify Blockchain Integration

1. **Check transaction confirmations** on the blockchain
2. **Verify balances** are updated correctly
3. **Test event resolution** with AI integration
4. **Validate bet processing** and payouts

## Phase 6: Production Deployment

### 6.1 Mainnet Deployment

```bash
# Deploy to Qubic mainnet (requires IPO process)
# Follow Qubic's mainnet deployment guidelines
# This involves community voting and approval
```

### 6.2 Production Configuration

```bash
# Update environment variables for production
QUBIC_NODE_IP=mainnet-node-ip
QUBIC_NODE_PORT=mainnet-port
QUBIC_CONTRACT_ADDRESS=production-contract-address
```

### 6.3 Monitoring & Maintenance

1. **Set up monitoring** for Qubic node connectivity
2. **Implement error alerting** for failed transactions
3. **Monitor contract balance** and gas usage
4. **Regular health checks** for blockchain integration

## Troubleshooting

### Common Issues

**1. Contract Compilation Errors**
- Check QPI syntax compliance
- Verify all data types are from qpi.h
- Ensure no prohibited C++ features are used

**2. Network Connection Issues**
- Verify testnet IP and port
- Check firewall settings
- Confirm Qubic CLI permissions

**3. Transaction Failures**
- Check user balance sufficiency
- Verify contract state and active events
- Review transaction input data format

**4. Bridge Communication Errors**
- Validate Qubic CLI installation
- Check environment variable configuration
- Review serialization/deserialization logic

### Debug Commands

```bash
# Test Qubic CLI directly
./qubic-cli -nodeip <ip> -nodeport <port> -getcurrenttick

# Check contract balance
./qubic-cli -nodeip <ip> -nodeport <port> -getbalance <contract-address>

# Verify node connectivity
ping <testnet-ip>
telnet <testnet-ip> 31841
```

## Support Resources

- **Qubic Discord**: [discord.gg/qubic](https://discord.gg/qubic)
- **Documentation**: [docs.qubic.org](https://docs.qubic.org)
- **GitHub Issues**: [github.com/qubic/core](https://github.com/qubic/core)
- **Hackathon Examples**: [github.com/qubic/hackathon-madrid](https://github.com/qubic/hackathon-madrid)

## Next Steps

1. **Complete smart contract testing** on testnet
2. **Implement all bridge functions** with proper error handling
3. **Add comprehensive frontend integration** with transaction tracking
4. **Prepare for mainnet deployment** following Qubic's IPO process
5. **Scale system architecture** for production load

This hybrid approach gives you the benefits of Qubic's high-performance blockchain while maintaining your excellent web interface and user experience.