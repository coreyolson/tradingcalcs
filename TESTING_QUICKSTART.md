# Quick Test Reference

## Run Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-reruns on file changes)
npm run test:watch

# Run tests with detailed output
npm run test:verbose

# Run specific test file
npm test tests/server.test.js

# Run tests matching a pattern
npm test -- -t "Contract Calculations"
```

## Test Results

✅ **79 tests passing**
✅ **3 test suites passing**
✅ **Execution time: ~1.2-1.6 seconds**

## Test Files

1. **tests/server.test.js** (49 tests)
   - API endpoints
   - Monte Carlo simulation
   - Helper functions
   - Edge cases

2. **tests/app.test.js** (16 tests)
   - Frontend calculations
   - Contract math
   - Utility functions
   - Preset management

3. **tests/integration.test.js** (14 tests)
   - Full trading scenarios
   - Strategy comparisons
   - Real-world simulations

## What's Tested

### ✅ All Financial Calculations
- Risk per trade
- Expected value
- Kelly fraction
- Profit factor
- Payoff ratio

### ✅ All Contract Calculations
- Contract size (with step rounding)
- Entry cost
- Stop loss cost
- Win target
- Daily fees
- Break-even win rate

### ✅ All Monte Carlo Features
- Balance tracking
- Drawdown calculation
- Statistical analysis
- Histogram generation
- Ruin probability

### ✅ All Trading Strategies
- Conservative (5% risk, 85% WR, 1 trade/day)
- Moderate (8% risk, 80% WR, 2 trades/day)
- Aggressive (12% risk, 75% WR, 3 trades/day)

### ✅ Edge Cases
- 100% win rate
- 0% win rate
- Zero commission
- Account ruin
- Break-even scenarios
- Extreme account sizes

## Files Created

```
/tests
├── server.test.js          # Backend API tests
├── app.test.js             # Frontend calculation tests
├── integration.test.js     # Full scenario tests
└── README.md               # Detailed test documentation
```

## Quick Verification

Want to verify everything works? Just run:

```bash
npm test
```

You should see:
```
Test Suites: 3 passed, 3 total
Tests:       79 passed, 79 total
Time:        ~1.2s
```

That's it! 🎉
