# PredictoR Qubic Integration Plan

## Overview

This plan outlines the hybrid approach to integrate PredictoR with Qubic Network, keeping your existing React web interface while moving core betting logic to C++ smart contracts on Qubic.

## Architecture

### Current Web Stack (Frontend)
- **React Frontend**: Keep existing UI components and user experience
- **Express Backend**: Transform into bridge/proxy server
- **TanStack Query**: Continue using for state management

### New Qubic Backend (Core Logic)
- **C++ Smart Contract**: Handle betting logic, balance management, event resolution
- **Qubic CLI Integration**: For transaction submission and contract interaction
- **Bridge API**: Connect web frontend to Qubic smart contract

## Implementation Phases

### Phase 1: Smart Contract Development (Week 1-2)

#### 1.1 Set Up Qubic Development Environment
- Fork Qubic core repository: https://github.com/qubic/core
- Switch to `madrid-2025` branch for template
- Set up local development environment with QPI

#### 1.2 Design PredictoR Smart Contract Structure
```cpp
// Contract state structure
struct PredictorState {
    // User management
    collection<User, 1000> users;
    uint32_1000 userBalances; // Map user ID to balance
    
    // Event management
    collection<Event, 100> events;
    uint32_100 eventResolutions; // Map event ID to resolution
    
    // Betting system
    collection<Bet, 10000> bets;
    uint32_10000 betResults; // Map bet ID to result
    
    // Contract settings
    uint32 nextUserId;
    uint32 nextEventId;
    uint32 nextBetId;
    uint32 defaultBalance; // Starting balance (100 QU)
    uint32 betCost; // Cost per bet (10 QU)
    uint32 winReward; // Reward for winning (20 QU)
};
```

#### 1.3 Implement Core Smart Contract Functions
- `registerUser()`: Create new user account
- `createEvent()`: Add new prediction event
- `placeBet()`: Place bet on event
- `resolveEvent()`: Resolve event with AI result
- `getBalance()`: Query user balance
- `getUserBets()`: Get user's betting history
- `getEvents()`: Get active events list

### Phase 2: Bridge Development (Week 2-3)

#### 2.1 Create Qubic Bridge Server
- Transform existing Express server into bridge
- Add Qubic CLI integration for contract calls
- Implement transaction signing and submission
- Add error handling and retry logic

#### 2.2 Bridge API Endpoints
```typescript
// Bridge API routes
app.post('/qubic/user/register', async (req, res) => {
    // Call Qubic contract registerUser function
});

app.post('/qubic/bet/place', async (req, res) => {
    // Call Qubic contract placeBet function
});

app.get('/qubic/events', async (req, res) => {
    // Call Qubic contract getEvents function
});

app.get('/qubic/user/:id/balance', async (req, res) => {
    // Call Qubic contract getBalance function
});
```

### Phase 3: Frontend Integration (Week 3-4)

#### 3.1 Update API Client
- Modify existing API calls to use Qubic bridge endpoints
- Add transaction status tracking
- Implement proper error handling for blockchain operations

#### 3.2 Add Qubic-Specific Features
- Transaction status indicators
- Blockchain explorer links
- Smart contract address display
- Network status monitoring

### Phase 4: Testing & Deployment (Week 4-5)

#### 4.1 Local Testing
- Test smart contract functions using Qubic CLI
- Verify bridge API functionality
- End-to-end testing of web interface

#### 4.2 Testnet Deployment
- Deploy to Qubic testnet using hackathon infrastructure
- Test with real blockchain environment
- Performance and reliability testing

#### 4.3 Production Deployment
- Deploy smart contract to Qubic mainnet
- Set up production bridge server
- Monitor system performance

## Technical Details

### Smart Contract Functions

#### User Management
```cpp
// Register new user
REGISTER_USER_FUNCTION(registerUser, 0) {
    // Validate input
    // Create user with default balance
    // Return user ID
}

// Get user balance
REGISTER_USER_FUNCTION(getBalance, 1) {
    // Return user's current balance
}
```

#### Event Management
```cpp
// Create new event
REGISTER_USER_FUNCTION(createEvent, 2) {
    // Validate event data
    // Add to events collection
    // Return event ID
}

// Get active events
REGISTER_USER_FUNCTION(getEvents, 3) {
    // Return list of active events
}
```

#### Betting System
```cpp
// Place bet
REGISTER_USER_FUNCTION(placeBet, 4) {
    // Validate bet data
    // Check user balance
    // Deduct bet cost
    // Create bet record
    // Return bet ID
}

// Resolve event
REGISTER_USER_FUNCTION(resolveEvent, 5) {
    // Update event resolution
    // Calculate bet results
    // Update user balances
    // Emit resolution event
}
```

### Bridge Server Architecture

#### Transaction Management
```typescript
class QubicBridge {
    private cli: QubicCLI;
    private contractAddress: string;
    
    async callContract(functionIndex: number, inputData: any): Promise<any> {
        // Serialize input data
        // Submit transaction via CLI
        // Wait for confirmation
        // Return result
    }
    
    async queryContract(functionIndex: number, inputData: any): Promise<any> {
        // Call contract function (read-only)
        // Return result immediately
    }
}
```

#### Error Handling
```typescript
class QubicError extends Error {
    constructor(
        message: string,
        public code: string,
        public qubicError?: any
    ) {
        super(message);
    }
}

// Error types
enum QubicErrorCodes {
    INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
    INVALID_EVENT = 'INVALID_EVENT',
    TRANSACTION_FAILED = 'TRANSACTION_FAILED',
    NETWORK_ERROR = 'NETWORK_ERROR'
}
```

### Frontend Updates

#### Transaction Status Component
```typescript
interface TransactionStatus {
    id: string;
    status: 'pending' | 'confirmed' | 'failed';
    hash?: string;
    error?: string;
}

const TransactionStatusModal: React.FC<{
    transaction: TransactionStatus;
    onClose: () => void;
}> = ({ transaction, onClose }) => {
    // Display transaction progress
    // Show error messages
    // Provide retry options
};
```

#### Qubic Integration Hook
```typescript
const useQubicContract = () => {
    const placeBet = async (eventId: number, prediction: string, amount: number) => {
        // Call bridge API
        // Track transaction status
        // Update UI state
    };
    
    const getBalance = async (userId: number) => {
        // Query user balance
        // Return current balance
    };
    
    return { placeBet, getBalance };
};
```

## Migration Strategy

### Data Migration
1. **Export Current Data**: Export existing events and user data
2. **Initialize Contract**: Set up smart contract with initial state
3. **Import Data**: Use contract functions to recreate state
4. **Validate**: Ensure data integrity after migration

### Gradual Rollout
1. **Parallel Operation**: Run both systems temporarily
2. **Feature Flags**: Toggle between old and new systems
3. **User Migration**: Gradually move users to new system
4. **System Cutover**: Complete migration to Qubic

## Benefits of Hybrid Approach

### Technical Benefits
- **Performance**: Leverage Qubic's high-performance execution
- **Decentralization**: Core logic runs on blockchain
- **Transparency**: All betting logic is publicly verifiable
- **Scalability**: Qubic handles millions of transactions per second

### User Experience Benefits
- **Familiar Interface**: Keep existing web UI
- **Instant Feedback**: Local UI updates with blockchain confirmation
- **Error Recovery**: Bridge handles transaction failures gracefully
- **Cross-Platform**: Web interface works on all devices

### Business Benefits
- **Compliance**: Meet Qubic Network deployment requirements
- **Innovation**: Leverage cutting-edge blockchain technology
- **Community**: Join Qubic ecosystem and developer community
- **Future-Proof**: Built on advanced blockchain architecture

## Timeline

| Week | Phase | Tasks |
|------|-------|-------|
| 1 | Setup | Fork repository, setup development environment |
| 2 | Smart Contract | Implement core betting logic in C++ |
| 3 | Bridge | Create bridge server and API endpoints |
| 4 | Frontend | Update web interface to use bridge |
| 5 | Testing | Comprehensive testing and deployment |

## Next Steps

1. **Research Qubic Documentation**: Study QPI and smart contract examples
2. **Set Up Development Environment**: Fork repository and prepare tools
3. **Start with Simple Contract**: Begin with basic user and balance management
4. **Build Bridge Incrementally**: Add one API endpoint at a time
5. **Test Early and Often**: Validate each component before moving forward

This hybrid approach allows you to leverage Qubic's advanced blockchain capabilities while maintaining your excellent web interface and user experience.