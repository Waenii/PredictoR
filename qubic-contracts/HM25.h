// PredictoR Betting Platform - Qubic Smart Contract
// Based on HM25 Template for Qubic Hackathon

#pragma once

#include "../contract_core/contract_def.h"

// Contract constants
#define DEFAULT_BALANCE 100
#define BET_COST 10
#define WIN_REWARD 20
#define MAX_USERS 10000
#define MAX_EVENTS 1000
#define MAX_BETS 100000

// Input/Output structures for contract functions

struct RegisterUserInput {
    char username[32];
    char passwordHash[32];
};

struct RegisterUserOutput {
    uint32 userId;
    uint32 balance;
    uint8 success;
};

struct CreateEventInput {
    char title[128];
    char description[256];
    char category[32];
    uint32 endsAt;
};

struct CreateEventOutput {
    uint32 eventId;
    uint8 success;
};

struct PlaceBetInput {
    uint32 userId;
    uint32 eventId;
    uint8 prediction;  // 0 = NO, 1 = YES
    uint32 amount;
};

struct PlaceBetOutput {
    uint32 betId;
    uint32 newBalance;
    uint8 success;
};

struct ResolveEventInput {
    uint32 eventId;
    uint8 correctAnswer;  // 0 = NO, 1 = YES
    uint8 confidence;
};

struct ResolveEventOutput {
    uint32 winnersCount;
    uint32 totalPayout;
    uint8 success;
};

struct GetBalanceInput {
    uint32 userId;
};

struct GetBalanceOutput {
    uint32 balance;
    uint8 success;
};

struct GetEventsInput {
    uint32 startIndex;
    uint32 count;
};

struct GetEventsOutput {
    uint32 eventCount;
    char events[1000];  // JSON serialized events data
    uint8 success;
};

// Data structures
struct User {
    char username[32];
    char passwordHash[32];
    uint32 balance;
    uint32 totalBets;
    uint32 totalWins;
    uint8 isActive;
    uint32 id;
};

struct Event {
    char title[128];
    char description[256];
    char category[32];
    uint32 createdAt;
    uint32 endsAt;
    uint8 isActive;
    uint8 isResolved;
    uint8 correctAnswer;
    uint32 totalBets;
    uint32 yesBets;
    uint32 noBets;
    uint32 id;
};

struct Bet {
    uint32 userId;
    uint32 eventId;
    uint8 prediction;
    uint32 amount;
    uint32 createdAt;
    uint8 isWon;
    uint8 isProcessed;
    uint32 id;
};

struct CONTRACT_STATE
{
    // Storage arrays
    User users[MAX_USERS];
    Event events[MAX_EVENTS];
    Bet bets[MAX_BETS];
    
    // Counters
    uint32 userCount;
    uint32 eventCount;
    uint32 betCount;
    
    // Settings
    uint32 defaultBalance;
    uint32 betCost;
    uint32 winReward;
    
    // Stats
    uint32 totalUsers;
    uint32 totalEvents;
    uint32 totalBets;
    uint32 totalVolume;
    
    // Admin
    m256i adminId;
    uint8 contractActive;
    
    // Local variables for function execution
    uint32 tempUserId;
    uint32 tempEventId;
    uint32 tempBetId;
    uint32 tempBalance;
    uint32 tempAmount;
    uint8 tempResult;
    uint32 tempCount;
    uint32 tempIndex;
    User tempUser;
    Event tempEvent;
    Bet tempBet;
};

BEGIN_CONTRACT(PredictoR)

    // Function declarations
    public_function(RegisterUser, 0);
    public_function(CreateEvent, 1);
    public_function(PlaceBet, 2);
    public_function(ResolveEvent, 3);
    public_function(GetBalance, 4);
    public_function(GetEvents, 5);
    public_function(GetUserBets, 6);
    
    // Procedure declarations
    public_procedure(Initialize, 0);

    REGISTER_USER_FUNCTIONS_AND_PROCEDURES
        REGISTER_USER_FUNCTION(RegisterUser, 0);
        REGISTER_USER_FUNCTION(CreateEvent, 1);
        REGISTER_USER_FUNCTION(PlaceBet, 2);
        REGISTER_USER_FUNCTION(ResolveEvent, 3);
        REGISTER_USER_FUNCTION(GetBalance, 4);
        REGISTER_USER_FUNCTION(GetEvents, 5);
        REGISTER_USER_FUNCTION(GetUserBets, 6);
        REGISTER_USER_PROCEDURE(Initialize, 0);
    END_REGISTER_USER_FUNCTIONS_AND_PROCEDURES

    // Initialize contract
    PUBLIC(Initialize)
    {
        // Set default values
        state.defaultBalance = DEFAULT_BALANCE;
        state.betCost = BET_COST;
        state.winReward = WIN_REWARD;
        state.contractActive = 1;
        
        // Initialize counters
        state.userCount = 0;
        state.eventCount = 0;
        state.betCount = 0;
        
        // Reset stats
        state.totalUsers = 0;
        state.totalEvents = 0;
        state.totalBets = 0;
        state.totalVolume = 0;
        
        // Set admin
        state.adminId = invocator();
        
        // Initialize sample events for hackathon demo
        if (state.eventCount == 0) {
            // Event 1
            state.tempEvent.id = 1;
            copyMem(state.tempEvent.title, "Will Tesla stock reach $300 by end of 2025?", 45);
            copyMem(state.tempEvent.description, "Predict whether Tesla's stock price will hit $300 per share by December 31, 2025.", 84);
            copyMem(state.tempEvent.category, "Technology", 11);
            state.tempEvent.createdAt = system.tick;
            state.tempEvent.endsAt = system.tick + 604800; // 7 days
            state.tempEvent.isActive = 1;
            state.tempEvent.isResolved = 0;
            state.tempEvent.totalBets = 0;
            state.tempEvent.yesBets = 0;
            state.tempEvent.noBets = 0;
            state.events[state.eventCount] = state.tempEvent;
            state.eventCount++;
            
            // Event 2
            state.tempEvent.id = 2;
            copyMem(state.tempEvent.title, "Will Bitcoin reach $150,000 by end of 2025?", 44);
            copyMem(state.tempEvent.description, "Predict whether Bitcoin will hit the $150,000 milestone by December 2025.", 74);
            copyMem(state.tempEvent.category, "Crypto", 7);
            state.tempEvent.createdAt = system.tick;
            state.tempEvent.endsAt = system.tick + 1209600; // 14 days
            state.tempEvent.isActive = 1;
            state.tempEvent.isResolved = 0;
            state.tempEvent.totalBets = 0;
            state.tempEvent.yesBets = 0;
            state.tempEvent.noBets = 0;
            state.events[state.eventCount] = state.tempEvent;
            state.eventCount++;
            
            // Event 3
            state.tempEvent.id = 3;
            copyMem(state.tempEvent.title, "Will there be a new iPhone model released in 2025?", 51);
            copyMem(state.tempEvent.description, "Predict whether Apple will announce a new iPhone model during 2025.", 68);
            copyMem(state.tempEvent.category, "Technology", 11);
            state.tempEvent.createdAt = system.tick;
            state.tempEvent.endsAt = system.tick + 864000; // 10 days
            state.tempEvent.isActive = 1;
            state.tempEvent.isResolved = 0;
            state.tempEvent.totalBets = 0;
            state.tempEvent.yesBets = 0;
            state.tempEvent.noBets = 0;
            state.events[state.eventCount] = state.tempEvent;
            state.eventCount++;
            
            // Event 4
            state.tempEvent.id = 4;
            copyMem(state.tempEvent.title, "Will SpaceX successfully land humans on Mars in 2025?", 54);
            copyMem(state.tempEvent.description, "Predict whether SpaceX will achieve their goal of landing humans on Mars during 2025.", 86);
            copyMem(state.tempEvent.category, "Space", 6);
            state.tempEvent.createdAt = system.tick;
            state.tempEvent.endsAt = system.tick + 1814400; // 21 days
            state.tempEvent.isActive = 1;
            state.tempEvent.isResolved = 0;
            state.tempEvent.totalBets = 0;
            state.tempEvent.yesBets = 0;
            state.tempEvent.noBets = 0;
            state.events[state.eventCount] = state.tempEvent;
            state.eventCount++;
            
            state.totalEvents = 4;
        }
        
        // Create default user for hackathon demo
        if (state.userCount == 0) {
            state.tempUser.id = 1;
            copyMem(state.tempUser.username, "player1", 8);
            copyMem(state.tempUser.passwordHash, "password", 9);
            state.tempUser.balance = DEFAULT_BALANCE;
            state.tempUser.totalBets = 0;
            state.tempUser.totalWins = 0;
            state.tempUser.isActive = 1;
            state.users[state.userCount] = state.tempUser;
            state.userCount++;
            state.totalUsers = 1;
        }
    }

    // Register new user
    PUBLIC(RegisterUser)
    {
        RegisterUserInput* input = (RegisterUserInput*)inputBuffer;
        RegisterUserOutput* output = (RegisterUserOutput*)outputBuffer;
        
        // Initialize output
        output->success = 0;
        output->userId = 0;
        output->balance = 0;
        
        // Check if contract is active
        if (!state.contractActive) {
            return;
        }
        
        // Check if we have space for new user
        if (state.userCount >= MAX_USERS) {
            return;
        }
        
        // Create new user
        state.tempUser.id = state.userCount + 1;
        copyMem(state.tempUser.username, input->username, 32);
        copyMem(state.tempUser.passwordHash, input->passwordHash, 32);
        state.tempUser.balance = state.defaultBalance;
        state.tempUser.totalBets = 0;
        state.tempUser.totalWins = 0;
        state.tempUser.isActive = 1;
        
        // Add user to array
        state.users[state.userCount] = state.tempUser;
        
        // Set output
        output->userId = state.tempUser.id;
        output->balance = state.defaultBalance;
        output->success = 1;
        
        // Update counters
        state.userCount++;
        state.totalUsers++;
    }

    // Create new event
    PUBLIC(CreateEvent)
    {
        CreateEventInput* input = (CreateEventInput*)inputBuffer;
        CreateEventOutput* output = (CreateEventOutput*)outputBuffer;
        
        // Initialize output
        output->success = 0;
        output->eventId = 0;
        
        // Check if contract is active
        if (!state.contractActive) {
            return;
        }
        
        // Check if we have space for new event
        if (state.eventCount >= MAX_EVENTS) {
            return;
        }
        
        // Only admin can create events for now
        if (!isEqual(invocator(), state.adminId)) {
            return;
        }
        
        // Create new event
        state.tempEvent.id = state.eventCount + 1;
        copyMem(state.tempEvent.title, input->title, 128);
        copyMem(state.tempEvent.description, input->description, 256);
        copyMem(state.tempEvent.category, input->category, 32);
        state.tempEvent.createdAt = system.tick;
        state.tempEvent.endsAt = input->endsAt;
        state.tempEvent.isActive = 1;
        state.tempEvent.isResolved = 0;
        state.tempEvent.correctAnswer = 0;
        state.tempEvent.totalBets = 0;
        state.tempEvent.yesBets = 0;
        state.tempEvent.noBets = 0;
        
        // Add event to array
        state.events[state.eventCount] = state.tempEvent;
        
        // Set output
        output->eventId = state.tempEvent.id;
        output->success = 1;
        
        // Update counters
        state.eventCount++;
        state.totalEvents++;
    }

    // Place bet on event
    PUBLIC(PlaceBet)
    {
        PlaceBetInput* input = (PlaceBetInput*)inputBuffer;
        PlaceBetOutput* output = (PlaceBetOutput*)outputBuffer;
        
        // Initialize output
        output->success = 0;
        output->betId = 0;
        output->newBalance = 0;
        
        // Check if contract is active
        if (!state.contractActive) {
            return;
        }
        
        // Check if we have space for new bet
        if (state.betCount >= MAX_BETS) {
            return;
        }
        
        // Find user
        state.tempUserId = 0;
        for (state.tempIndex = 0; state.tempIndex < state.userCount; state.tempIndex++) {
            if (state.users[state.tempIndex].id == input->userId) {
                state.tempUserId = state.tempIndex;
                state.tempUser = state.users[state.tempIndex];
                break;
            }
        }
        
        if (state.tempUserId == 0 && state.users[0].id != input->userId) {
            return; // User not found
        }
        
        // Check user balance
        if (state.tempUser.balance < input->amount) {
            return; // Insufficient balance
        }
        
        // Find event
        state.tempEventId = 0;
        for (state.tempIndex = 0; state.tempIndex < state.eventCount; state.tempIndex++) {
            if (state.events[state.tempIndex].id == input->eventId) {
                state.tempEventId = state.tempIndex;
                state.tempEvent = state.events[state.tempIndex];
                break;
            }
        }
        
        if (state.tempEventId == 0 && state.events[0].id != input->eventId) {
            return; // Event not found
        }
        
        // Check if event is active
        if (!state.tempEvent.isActive || state.tempEvent.isResolved) {
            return; // Event not available for betting
        }
        
        // Create bet
        state.tempBet.id = state.betCount + 1;
        state.tempBet.userId = input->userId;
        state.tempBet.eventId = input->eventId;
        state.tempBet.prediction = input->prediction;
        state.tempBet.amount = input->amount;
        state.tempBet.createdAt = system.tick;
        state.tempBet.isWon = 0;
        state.tempBet.isProcessed = 0;
        
        // Add bet to array
        state.bets[state.betCount] = state.tempBet;
        
        // Update user balance
        state.tempUser.balance = state.tempUser.balance - input->amount;
        state.tempUser.totalBets++;
        state.users[state.tempUserId] = state.tempUser;
        
        // Update event stats
        state.tempEvent.totalBets++;
        if (input->prediction == 1) {
            state.tempEvent.yesBets++;
        } else {
            state.tempEvent.noBets++;
        }
        state.events[state.tempEventId] = state.tempEvent;
        
        // Set output
        output->betId = state.tempBet.id;
        output->newBalance = state.tempUser.balance;
        output->success = 1;
        
        // Update counters
        state.betCount++;
        state.totalBets++;
        state.totalVolume = state.totalVolume + input->amount;
    }

    // Resolve event and process bets
    PUBLIC(ResolveEvent)
    {
        ResolveEventInput* input = (ResolveEventInput*)inputBuffer;
        ResolveEventOutput* output = (ResolveEventOutput*)outputBuffer;
        
        // Initialize output
        output->success = 0;
        output->winnersCount = 0;
        output->totalPayout = 0;
        
        // Check if contract is active
        if (!state.contractActive) {
            return;
        }
        
        // Only admin can resolve events (for now)
        if (!isEqual(invocator(), state.adminId)) {
            return;
        }
        
        // Find event
        state.tempEventId = 0;
        for (state.tempIndex = 0; state.tempIndex < state.eventCount; state.tempIndex++) {
            if (state.events[state.tempIndex].id == input->eventId) {
                state.tempEventId = state.tempIndex;
                state.tempEvent = state.events[state.tempIndex];
                break;
            }
        }
        
        if (state.tempEventId == 0 && state.events[0].id != input->eventId) {
            return; // Event not found
        }
        
        // Check if event can be resolved
        if (!state.tempEvent.isActive || state.tempEvent.isResolved) {
            return; // Event already resolved
        }
        
        // Mark event as resolved
        state.tempEvent.isResolved = 1;
        state.tempEvent.isActive = 0;
        state.tempEvent.correctAnswer = input->correctAnswer;
        state.events[state.tempEventId] = state.tempEvent;
        
        // Process all bets for this event
        state.tempCount = 0;
        state.tempAmount = 0;
        
        for (state.tempIndex = 0; state.tempIndex < state.betCount; state.tempIndex++) {
            state.tempBet = state.bets[state.tempIndex];
            
            if (state.tempBet.eventId == input->eventId && !state.tempBet.isProcessed) {
                // Check if bet won
                if (state.tempBet.prediction == input->correctAnswer) {
                    state.tempBet.isWon = 1;
                    state.tempCount++;
                    state.tempAmount = state.tempAmount + state.winReward;
                    
                    // Find user and update balance
                    for (state.tempUserId = 0; state.tempUserId < state.userCount; state.tempUserId++) {
                        if (state.users[state.tempUserId].id == state.tempBet.userId) {
                            state.users[state.tempUserId].balance = state.users[state.tempUserId].balance + state.winReward;
                            state.users[state.tempUserId].totalWins++;
                            break;
                        }
                    }
                } else {
                    state.tempBet.isWon = 0;
                }
                
                state.tempBet.isProcessed = 1;
                state.bets[state.tempIndex] = state.tempBet;
            }
        }
        
        // Set output
        output->winnersCount = state.tempCount;
        output->totalPayout = state.tempAmount;
        output->success = 1;
    }

    // Get user balance
    PUBLIC(GetBalance)
    {
        GetBalanceInput* input = (GetBalanceInput*)inputBuffer;
        GetBalanceOutput* output = (GetBalanceOutput*)outputBuffer;
        
        // Initialize output
        output->success = 0;
        output->balance = 0;
        
        // Find user
        for (state.tempIndex = 0; state.tempIndex < state.userCount; state.tempIndex++) {
            if (state.users[state.tempIndex].id == input->userId) {
                output->balance = state.users[state.tempIndex].balance;
                output->success = 1;
                return;
            }
        }
    }

    // Get events list
    PUBLIC(GetEvents)
    {
        GetEventsInput* input = (GetEventsInput*)inputBuffer;
        GetEventsOutput* output = (GetEventsOutput*)outputBuffer;
        
        // Initialize output
        output->success = 0;
        output->eventCount = 0;
        
        // Count active events
        state.tempCount = 0;
        for (state.tempIndex = 0; state.tempIndex < state.eventCount; state.tempIndex++) {
            if (state.events[state.tempIndex].isActive) {
                state.tempCount++;
            }
        }
        
        output->eventCount = state.tempCount;
        output->success = 1;
        
        // Note: For a complete implementation, you would serialize the events
        // into the events field as JSON or binary data
    }

    // Get user bets
    PUBLIC(GetUserBets)
    {
        GetBalanceInput* input = (GetBalanceInput*)inputBuffer;  // Reusing input structure
        GetBalanceOutput* output = (GetBalanceOutput*)outputBuffer;  // Reusing output structure
        
        // Initialize output
        output->success = 0;
        output->balance = 0;  // Using as bet count
        
        // Count user's bets
        state.tempCount = 0;
        for (state.tempIndex = 0; state.tempIndex < state.betCount; state.tempIndex++) {
            if (state.bets[state.tempIndex].userId == input->userId) {
                state.tempCount++;
            }
        }
        
        output->balance = state.tempCount;  // Using balance field for bet count
        output->success = 1;
    }

    // System procedures
    BEGIN_EPOCH()
    {
        // Process epoch-based operations
    }

    END_EPOCH()
    {
        // Clean up expired events, process pending operations
    }

END_CONTRACT