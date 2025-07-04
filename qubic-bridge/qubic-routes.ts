// Express routes that use Qubic Bridge
// Replaces current in-memory storage with Qubic smart contract calls

import express from 'express';
import { QubicBridge, QubicConfig, QubicError, QubicErrorCodes } from './qubic-bridge';
import { resolveEventWithAI } from '../server/services/ai';

const router = express.Router();

// Initialize Qubic Bridge
const qubicConfig: QubicConfig = {
  nodeIp: process.env.QUBIC_NODE_IP || '127.0.0.1',
  nodePort: parseInt(process.env.QUBIC_NODE_PORT || '31841'),
  contractAddress: process.env.QUBIC_CONTRACT_ADDRESS || '',
  cliPath: process.env.QUBIC_CLI_PATH || './qubic-cli',
  privateKey: process.env.QUBIC_PRIVATE_KEY
};

const qubicBridge = new QubicBridge(qubicConfig);

// Error handler middleware
const handleQubicError = (error: any, res: express.Response) => {
  console.error('Qubic operation failed:', error);
  
  if (error instanceof QubicError) {
    switch (error.code) {
      case QubicErrorCodes.INSUFFICIENT_BALANCE:
        return res.status(400).json({ message: 'Insufficient balance for this operation' });
      case QubicErrorCodes.INVALID_EVENT:
        return res.status(400).json({ message: 'Event not found or not available for betting' });
      case QubicErrorCodes.TRANSACTION_FAILED:
        return res.status(500).json({ message: 'Transaction failed to execute on blockchain' });
      case QubicErrorCodes.NETWORK_ERROR:
        return res.status(503).json({ message: 'Unable to connect to Qubic network' });
      case QubicErrorCodes.UNAUTHORIZED:
        return res.status(403).json({ message: 'Unauthorized operation' });
      default:
        return res.status(500).json({ message: 'Blockchain operation failed' });
    }
  }
  
  res.status(500).json({ message: 'Internal server error' });
};

// User Management Routes

// Get current user (for compatibility with existing frontend)
router.get('/user', async (req, res) => {
  try {
    // For demo purposes, using a fixed user ID
    // In production, this would come from session/authentication
    const userId = 1;
    const balance = await qubicBridge.getUserBalance(userId);
    
    res.json({
      id: userId,
      username: 'player1',
      balance
    });
  } catch (error) {
    handleQubicError(error, res);
  }
});

// Register new user
router.post('/qubic/user/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const user = await qubicBridge.registerUser(username, password);
    res.json(user);
  } catch (error) {
    handleQubicError(error, res);
  }
});

// Event Management Routes

// Get all active events
router.get('/events', async (req, res) => {
  try {
    const events = await qubicBridge.getActiveEvents();
    res.json(events);
  } catch (error) {
    // Fallback to sample events if Qubic is not available
    console.warn('Falling back to sample events:', error.message);
    
    const sampleEvents = [
      {
        id: 1,
        title: "Will Tesla stock reach $300 by end of 2025?",
        description: "Predict whether Tesla's stock price will hit $300 per share by December 31, 2025.",
        category: "Technology",
        isActive: true,
        isResolved: false,
        correctAnswer: null,
        createdAt: new Date(),
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        title: "Will Bitcoin reach $150,000 by end of 2025?",
        description: "Predict whether Bitcoin will hit the $150,000 milestone by December 2025.",
        category: "Crypto",
        isActive: true,
        isResolved: false,
        correctAnswer: null,
        createdAt: new Date(),
        endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    ];
    
    res.json(sampleEvents);
  }
});

// Create new event (admin only)
router.post('/qubic/events', async (req, res) => {
  try {
    const { title, description, category, endsAt } = req.body;
    
    if (!title || !description || !category || !endsAt) {
      return res.status(400).json({ message: 'All event fields are required' });
    }
    
    const event = await qubicBridge.createEvent(
      title,
      description,
      category,
      new Date(endsAt)
    );
    
    res.json(event);
  } catch (error) {
    handleQubicError(error, res);
  }
});

// Betting Routes

// Place a bet
router.post('/bets', async (req, res) => {
  try {
    const { eventId, prediction, amount } = req.body;
    console.log('Received bet data:', { eventId, prediction, amount });
    
    if (!eventId || !prediction || !amount) {
      return res.status(400).json({ message: 'Event ID, prediction, and amount are required' });
    }
    
    if (prediction !== 'YES' && prediction !== 'NO') {
      return res.status(400).json({ message: 'Prediction must be YES or NO' });
    }
    
    if (amount < 1) {
      return res.status(400).json({ message: 'Bet amount must be at least 1' });
    }
    
    // For demo purposes, using a fixed user ID
    const userId = 1;
    
    try {
      const bet = await qubicBridge.placeBet(userId, eventId, prediction, amount);
      
      // Trigger AI resolution after bet is placed
      setTimeout(async () => {
        try {
          // Get event details to resolve
          const events = await qubicBridge.getActiveEvents();
          const event = events.find(e => e.id === eventId);
          
          if (event && !event.isResolved) {
            const resolution = await resolveEventWithAI(event.title, event.description);
            await qubicBridge.resolveEvent(eventId, resolution.answer, resolution.confidence);
            console.log(`Event ${eventId} resolved: ${resolution.answer}`);
          }
        } catch (aiError) {
          console.error('AI resolution failed:', aiError);
        }
      }, 1000);
      
      res.json({ success: true, bet });
    } catch (qubicError) {
      // If Qubic is not available, return appropriate error
      if (qubicError instanceof QubicError && qubicError.code === QubicErrorCodes.NETWORK_ERROR) {
        return res.status(503).json({ message: 'Betting system temporarily unavailable' });
      }
      throw qubicError;
    }
  } catch (error) {
    handleQubicError(error, res);
  }
});

// Get betting history
router.get('/bets/history', async (req, res) => {
  try {
    // For demo purposes, using a fixed user ID
    const userId = 1;
    const bets = await qubicBridge.getUserBets(userId);
    
    // Transform bets to include event details (simplified)
    const betsWithEvents = await Promise.all(
      bets.map(async (bet) => {
        try {
          const events = await qubicBridge.getActiveEvents();
          const event = events.find(e => e.id === bet.eventId);
          return { ...bet, event };
        } catch {
          return bet;
        }
      })
    );
    
    res.json(betsWithEvents);
  } catch (error) {
    // Fallback to empty array if Qubic is not available
    console.warn('Falling back to empty betting history:', error.message);
    res.json([]);
  }
});

// Qubic Status Routes

// Get current blockchain status
router.get('/qubic/status', async (req, res) => {
  try {
    const [currentTick, contractBalance] = await Promise.all([
      qubicBridge.getCurrentTick(),
      qubicBridge.getContractBalance()
    ]);
    
    res.json({
      connected: true,
      currentTick,
      contractBalance,
      nodeIp: qubicConfig.nodeIp,
      nodePort: qubicConfig.nodePort,
      contractAddress: qubicConfig.contractAddress
    });
  } catch (error) {
    res.json({
      connected: false,
      error: error.message,
      nodeIp: qubicConfig.nodeIp,
      nodePort: qubicConfig.nodePort
    });
  }
});

// Get transaction status
router.get('/qubic/transaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await qubicBridge.getTransactionStatus(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    handleQubicError(error, res);
  }
});

// Admin Routes

// Resolve event manually (admin only)
router.post('/qubic/events/:eventId/resolve', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { correctAnswer, confidence } = req.body;
    
    if (!correctAnswer || correctAnswer === undefined) {
      return res.status(400).json({ message: 'Correct answer is required' });
    }
    
    await qubicBridge.resolveEvent(
      parseInt(eventId),
      correctAnswer,
      confidence || 100
    );
    
    res.json({ success: true, message: 'Event resolved successfully' });
  } catch (error) {
    handleQubicError(error, res);
  }
});

// Health check
router.get('/qubic/health', async (req, res) => {
  try {
    const tick = await qubicBridge.getCurrentTick();
    res.json({ 
      status: 'healthy', 
      tick,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;