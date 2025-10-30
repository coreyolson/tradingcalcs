# Complete Test Coverage Plan - Trading Risk Calculator

## Files to Test

### ✅ Already Tested (Partial Coverage)
1. **server.js** - Backend API
   - Current: API endpoints tested
   - Missing: Need to actually import and test the real file

2. **public/app.js** - Frontend JavaScript  
   - Current: Calculation logic tested
   - Missing: Need to test actual file with DOM interactions

3. **Integration tests** - End-to-end scenarios
   - Current: Full scenarios tested
   - Status: Good coverage

### 📋 Test Tasks

#### Task 1: Complete server.js Coverage
- [ ] Import actual server.js file for testing
- [ ] Test all branches in runMonteCarloSimulation
- [ ] Test all branches in createHistogram
- [ ] Test all branches in calculateStreakProbabilities  
- [ ] Test all branches in calculateDrawdownScenarios
- [ ] Test error handling branches
- [ ] Test edge cases in each function

#### Task 2: Complete public/app.js Coverage
- [ ] Test with JSDOM environment
- [ ] Test all DOM manipulation functions
- [ ] Test all event handlers
- [ ] Test all branches in displayResults
- [ ] Test createProjectionChart with Chart.js mocks
- [ ] Test createMonteCarloChart with Chart.js mocks
- [ ] Test populateStreakTable
- [ ] Test populateDrawdownTable
- [ ] Test generatePositionSizing
- [ ] Test preset management functions
- [ ] Test localStorage interactions
- [ ] Test form validation
- [ ] Test URL parameter loading
- [ ] Test all conditional branches

#### Task 3: Module Extraction (if needed)
- [ ] Extract testable functions from app.js
- [ ] Create modular structure for better testing

## Coverage Goals

- **Branches**: 95%+
- **Functions**: 95%+
- **Lines**: 95%+
- **Statements**: 95%+

## Implementation Strategy

1. **Phase 1**: Refactor server.js tests to import actual file
2. **Phase 2**: Create comprehensive app.js tests with proper mocking
3. **Phase 3**: Add missing branch coverage
4. **Phase 4**: Verify coverage meets thresholds
5. **Phase 5**: Update package.json with coverage thresholds

## Current Coverage Status

Running: `npm test -- --coverage`

Will update with actual numbers...
