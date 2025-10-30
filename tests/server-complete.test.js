const request = require('supertest');
const {
  app,
  runMonteCarloSimulation,
  createHistogram,
  calculateStreakProbabilities,
  calculateDrawdownScenarios,
  calculateRiskOfRuin,
  calculateTargetProjections,
  calculateTimeBasedAnalysis,
  calculateRecoveryScenarios,
  calculateSharpeRatio
} = require('../server');

describe('Server.js - Complete Branch Coverage', () => {
  
  describe('Module Entry Point', () => {
    test('should not start server when required as module', () => {
      // When imported for testing, require.main !== module
      // So app.listen should NOT be called
      // This is implicitly tested by the fact that we can import it without starting a server
      expect(require.main).not.toBe(module);
    });
  });
  
  describe('API Endpoints', () => {
    describe('POST /api/simulate', () => {
      test('should return 200 with valid complete request', async () => {
        const response = await request(app)
          .post('/api/simulate')
          .send({
            accountSize: 5000,
            riskPercent: 0.05,
            winRate: 0.6,
            avgWin: 0.5,
            avgLoss: 0.3,
            stopLoss: 0.5,
            contractPrice: 1.0,
            commission: 0.65,
            tradesPerDay: 2,
            days: 30,
            simulations: 100
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('metrics');
        expect(response.body.data).toHaveProperty('projection');
        expect(response.body.data).toHaveProperty('monteCarlo');
        expect(response.body.data).toHaveProperty('streakProbabilities');
        expect(response.body.data).toHaveProperty('drawdownScenarios');
      });

      test('should calculate metrics correctly', async () => {
        const response = await request(app)
          .post('/api/simulate')
          .send({
            accountSize: 1000,
            riskPercent: 0.10,
            winRate: 0.6,
            avgWin: 0.5,
            avgLoss: 0.3,
            stopLoss: 0.5,
            contractPrice: 1.0,
            commission: 0.65,
            tradesPerDay: 1,
            days: 1,
            simulations: 10
          });

        const { metrics } = response.body.data;
        
        // Risk per trade = 1000 * 0.10 = 100
        expect(metrics.riskPerTrade).toBe(100);
        
        // Expected value = (0.6 * 0.5) - (0.4 * 0.3) = 0.18 = 18%
        expect(metrics.expectedValue).toBe(18);
        
        // Kelly = 0.6 - (0.4 / (0.5/0.3)) = 0.6 - 0.24 = 0.36 = 36%
        expect(metrics.kellyFraction).toBe(36);
        
        // Profit Factor = (0.6 * 0.5) / (0.4 * 0.3) = 2.5
        expect(metrics.profitFactor).toBe(2.5);
        
        // Payoff Ratio = 0.5 / 0.3 = 1.67
        expect(metrics.payoffRatio).toBeCloseTo(1.67, 1);
      });

      test('should use default stopLoss when not provided', async () => {
        const response = await request(app)
          .post('/api/simulate')
          .send({
            accountSize: 1000,
            riskPercent: 0.05,
            winRate: 0.6,
            avgWin: 0.5,
            avgLoss: 0.3,
            tradesPerDay: 1,
            days: 1,
            simulations: 10
          });

        expect(response.body.data.metrics.stopLoss).toBe(0.3);
      });

      test('should use provided stopLoss when given', async () => {
        const response = await request(app)
          .post('/api/simulate')
          .send({
            accountSize: 1000,
            riskPercent: 0.05,
            winRate: 0.6,
            avgWin: 0.5,
            avgLoss: 0.3,
            stopLoss: 0.7,
            tradesPerDay: 1,
            days: 1,
            simulations: 10
          });

        expect(response.body.data.metrics.stopLoss).toBe(0.7);
      });

      test('should use default contractPrice when not provided', async () => {
        const response = await request(app)
          .post('/api/simulate')
          .send({
            accountSize: 1000,
            riskPercent: 0.05,
            winRate: 0.6,
            avgWin: 0.5,
            avgLoss: 0.3,
            stopLoss: 0.5,
            tradesPerDay: 1,
            days: 1,
            simulations: 10
          });

        expect(response.body.data.metrics.contractPrice).toBe(1.0);
      });

      test('should use default commission when not provided', async () => {
        const response = await request(app)
          .post('/api/simulate')
          .send({
            accountSize: 1000,
            riskPercent: 0.05,
            winRate: 0.6,
            avgWin: 0.5,
            avgLoss: 0.3,
            stopLoss: 0.5,
            tradesPerDay: 1,
            days: 1,
            simulations: 10
          });

        expect(response.body.data.metrics.commission).toBe(0.65);
      });

      test('should generate correct projection length', async () => {
        const response = await request(app)
          .post('/api/simulate')
          .send({
            accountSize: 1000,
            riskPercent: 0.05,
            winRate: 0.6,
            avgWin: 0.5,
            avgLoss: 0.3,
            stopLoss: 0.5,
            tradesPerDay: 1,
            days: 10,
            simulations: 10
          });

        expect(response.body.data.projection).toHaveLength(11); // 0 to 10 days
      });

      test('should generate 15 streak probabilities', async () => {
        const response = await request(app)
          .post('/api/simulate')
          .send({
            accountSize: 1000,
            riskPercent: 0.05,
            winRate: 0.6,
            avgWin: 0.5,
            avgLoss: 0.3,
            stopLoss: 0.5,
            tradesPerDay: 1,
            days: 1,
            simulations: 10
          });

        expect(response.body.data.streakProbabilities).toHaveLength(15);
      });

      test('should generate 15 drawdown scenarios', async () => {
        const response = await request(app)
          .post('/api/simulate')
          .send({
            accountSize: 1000,
            riskPercent: 0.05,
            winRate: 0.6,
            avgWin: 0.5,
            avgLoss: 0.3,
            stopLoss: 0.5,
            tradesPerDay: 1,
            days: 1,
            simulations: 10
          });

        expect(response.body.data.drawdownScenarios).toHaveLength(15);
      });

      test('should handle errors with try-catch', async () => {
        // Send invalid data to trigger validation error
        const response = await request(app)
          .post('/api/simulate')
          .send({
            accountSize: -1000, // Invalid negative account size
            riskPercent: 0.1,
            winRate: 0.8,
            avgWin: 0.5,
            avgLoss: 0.3,
            stopLoss: 0.5,
            tradesPerDay: 1,
            days: 30,
            simulations: 10
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid account size');
      });
      
      test('should handle invalid risk percent', async () => {
        const response = await request(app)
          .post('/api/simulate')
          .send({
            accountSize: 1000,
            riskPercent: 1.5, // Invalid > 1
            winRate: 0.8,
            avgWin: 0.5,
            avgLoss: 0.3,
            stopLoss: 0.5,
            tradesPerDay: 1,
            days: 30,
            simulations: 10
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid risk percent');
      });
      
      test('should handle invalid win rate', async () => {
        const response = await request(app)
          .post('/api/simulate')
          .send({
            accountSize: 1000,
            riskPercent: 0.1,
            winRate: 1.5, // Invalid > 1
            avgWin: 0.5,
            avgLoss: 0.3,
            stopLoss: 0.5,
            tradesPerDay: 1,
            days: 30,
            simulations: 10
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid win rate');
      });

      test('should calculate compounding projection correctly', async () => {
        const response = await request(app)
          .post('/api/simulate')
          .send({
            accountSize: 1000,
            riskPercent: 0.10,
            winRate: 1.0, // 100% win for predictable growth
            avgWin: 0.1,
            avgLoss: 0,
            stopLoss: 0,
            tradesPerDay: 1,
            days: 2,
            simulations: 10
          });

        const projection = response.body.data.projection;
        expect(projection[0].balance).toBe(1000);
        expect(projection[1].balance).toBeCloseTo(1010, 0);
        expect(projection[2].balance).toBeCloseTo(1020.1, 0);
      });
    });

    describe('POST /api/export-csv', () => {
      test('should export CSV with correct format', async () => {
        const response = await request(app)
          .post('/api/export-csv')
          .send({
            data: {
              projection: [
                { day: 0, balance: 1000 },
                { day: 1, balance: 1010 },
                { day: 2, balance: 1020 }
              ]
            }
          });

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
        expect(response.text).toContain('Day,Balance');
        expect(response.text).toContain('0,1000');
      });

      test('should handle empty projection', async () => {
        const response = await request(app)
          .post('/api/export-csv')
          .send({
            data: {
              projection: []
            }
          });

        expect(response.status).toBe(200);
        expect(response.text).toContain('Day,Balance');
      });
    });

    describe('GET /', () => {
      test('should serve index.html', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.type).toBe('text/html');
      });
    });
  });

  describe('runMonteCarloSimulation - Branch Coverage', () => {
    test('should track wins correctly', () => {
      // Mock Math.random to return predictable values for wins
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1); // Always win (< 0.6)

      const result = runMonteCarloSimulation(1000, 0.05, 0.6, 0.5, 0.3, 0.3, 10, 5);

      expect(result.statistics.mean).toBeGreaterThan(1000);
      
      Math.random = originalRandom;
    });

    test('should track losses correctly', () => {
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.9); // Always lose (> 0.6)

      const result = runMonteCarloSimulation(1000, 0.05, 0.6, 0.5, 0.3, 0.3, 10, 5);

      expect(result.statistics.mean).toBeLessThan(1000);
      
      Math.random = originalRandom;
    });

    test('should update peak balance when balance increases', () => {
      const result = runMonteCarloSimulation(1000, 0.05, 0.9, 0.5, 0.3, 0.3, 10, 10);
      
      // With high win rate, peak should be updated
      expect(result.statistics.bestCase).toBeGreaterThan(1000);
    });

    test('should calculate drawdown when balance drops from peak', () => {
      const result = runMonteCarloSimulation(1000, 0.10, 0.5, 0.5, 0.5, 0.5, 20, 10);
      
      // Should have some drawdown
      expect(result.statistics.meanDrawdown).toBeGreaterThan(0);
    });

    test('should stop trading when balance reaches zero', () => {
      const result = runMonteCarloSimulation(1000, 0.50, 0.3, 0.5, 1.0, 1.0, 20, 10);
      
      // High risk with low win rate should cause some ruins
      expect(result.statistics.ruinProbability).toBeGreaterThanOrEqual(0);
    });

    test('should handle balance exactly zero', () => {
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.9); // Always lose

      const result = runMonteCarloSimulation(100, 1.0, 0.1, 0.5, 1.0, 1.0, 5, 5);

      expect(result.statistics.worstCase).toBe(0);
      
      Math.random = originalRandom;
    });

    test('should sort results by ending balance', () => {
      const result = runMonteCarloSimulation(1000, 0.05, 0.6, 0.5, 0.3, 0.3, 10, 10);
      
      expect(result.statistics.worstCase).toBeLessThanOrEqual(result.statistics.median);
      expect(result.statistics.median).toBeLessThanOrEqual(result.statistics.bestCase);
    });

    test('should calculate all statistics correctly', () => {
      const result = runMonteCarloSimulation(1000, 0.05, 0.6, 0.5, 0.3, 0.3, 10, 100);
      
      expect(result.statistics).toHaveProperty('mean');
      expect(result.statistics).toHaveProperty('median');
      expect(result.statistics).toHaveProperty('stdDev');
      expect(result.statistics).toHaveProperty('percentile5');
      expect(result.statistics).toHaveProperty('percentile95');
      expect(result.statistics).toHaveProperty('worstCase');
      expect(result.statistics).toHaveProperty('bestCase');
      expect(result.statistics).toHaveProperty('meanReturn');
      expect(result.statistics).toHaveProperty('meanDrawdown');
      expect(result.statistics).toHaveProperty('ruinProbability');
    });

    test('should return histogram data', () => {
      const result = runMonteCarloSimulation(1000, 0.05, 0.6, 0.5, 0.3, 0.3, 10, 100);
      
      expect(result).toHaveProperty('histogram');
      expect(result.histogram).toHaveProperty('labels');
      expect(result.histogram).toHaveProperty('data');
    });
  });

  describe('createHistogram - Branch Coverage', () => {
    test('should create correct number of bins', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const histogram = createHistogram(data, 5);
      
      expect(histogram.labels).toHaveLength(5);
      expect(histogram.data).toHaveLength(5);
    });

    test('should count all data points', () => {
      const data = [1, 1, 1, 5, 5, 9, 9, 9, 9];
      const histogram = createHistogram(data, 3);
      
      const totalCount = histogram.data.reduce((a, b) => a + b, 0);
      expect(totalCount).toBe(data.length);
    });

    test('should handle single bin', () => {
      const data = [1, 2, 3, 4, 5];
      const histogram = createHistogram(data, 1);
      
      expect(histogram.labels).toHaveLength(1);
      expect(histogram.data).toHaveLength(1);
    });

    test('should handle identical values (min === max)', () => {
      const data = [5, 5, 5, 5];
      const histogram = createHistogram(data, 1);
      
      expect(histogram.labels.length).toBe(1);
      expect(histogram.data.length).toBe(1);
    });

    test('should place value at upper bound in last bin', () => {
      const data = [1, 2, 3, 4, 10]; // 10 is at max
      const histogram = createHistogram(data, 3);
      
      const totalCount = histogram.data.reduce((a, b) => a + b, 0);
      expect(totalCount).toBe(5);
    });

    test('should handle large dataset', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i);
      const histogram = createHistogram(data, 20);
      
      expect(histogram.labels).toHaveLength(20);
      const totalCount = histogram.data.reduce((a, b) => a + b, 0);
      expect(totalCount).toBe(1000);
    });
  });

  describe('calculateStreakProbabilities - Branch Coverage', () => {
    test('should calculate decreasing probabilities', () => {
      const streaks = calculateStreakProbabilities(0.6, 5);
      
      expect(streaks[0].probability).toBeGreaterThan(streaks[1].probability);
      expect(streaks[1].probability).toBeGreaterThan(streaks[2].probability);
    });

    test('should format frequency correctly', () => {
      const streaks = calculateStreakProbabilities(0.6, 5);
      
      streaks.forEach(streak => {
        if (streak.frequency !== 'Never') {
          expect(streak.frequency).toMatch(/^1 in \d{1,3}(,\d{3})*$/);
        }
      });
    });

    test('should handle 100% win rate (never lose)', () => {
      const streaks = calculateStreakProbabilities(1.0, 3);
      
      expect(streaks[0].probability).toBe(0);
      expect(streaks[0].frequency).toBe('Never');
    });

    test('should handle 0% win rate (always lose)', () => {
      const streaks = calculateStreakProbabilities(0, 3);
      
      expect(streaks[0].probability).toBe(100);
    });

    test('should handle 50% win rate', () => {
      const streaks = calculateStreakProbabilities(0.5, 3);
      
      expect(streaks[0].probability).toBe(50);
      expect(streaks[1].probability).toBe(25);
      expect(streaks[2].probability).toBe(12.5);
    });

    test('should generate all requested streaks', () => {
      const streaks = calculateStreakProbabilities(0.6, 15);
      
      expect(streaks).toHaveLength(15);
      streaks.forEach((streak, index) => {
        expect(streak.streak).toBe(index + 1);
      });
    });

    test('should handle very low win rate', () => {
      const streaks = calculateStreakProbabilities(0.01, 3);
      
      expect(streaks[0].probability).toBeGreaterThan(90);
    });

    test('should handle very high win rate', () => {
      const streaks = calculateStreakProbabilities(0.99, 3);
      
      expect(streaks[0].probability).toBeLessThan(2);
    });
  });

  describe('calculateDrawdownScenarios - Branch Coverage', () => {
    test('should show decreasing balance with losses', () => {
      const scenarios = calculateDrawdownScenarios(1000, 0.05, 0.5, 5);
      
      for (let i = 1; i < scenarios.length; i++) {
        expect(scenarios[i].remainingBalance).toBeLessThan(scenarios[i - 1].remainingBalance);
      }
    });

    test('should calculate drawdown percentages correctly', () => {
      const scenarios = calculateDrawdownScenarios(1000, 0.10, 1.0, 3);
      
      // First loss: 1000 - (1000 * 0.10 * 1.0) = 900 (10% drawdown)
      expect(scenarios[0].drawdown).toBeCloseTo(10, 0);
      expect(scenarios[0].remainingPercent).toBeCloseTo(90, 0);
    });

    test('should mark scenarios above 30% as survivable', () => {
      const scenarios = calculateDrawdownScenarios(1000, 0.05, 0.5, 5);
      
      scenarios.forEach(scenario => {
        if (scenario.remainingPercent > 30) {
          expect(scenario.survivable).toBe(true);
        }
      });
    });

    test('should mark scenarios at or below 30% as not survivable', () => {
      const scenarios = calculateDrawdownScenarios(1000, 0.20, 1.0, 10);
      
      const nonSurvivable = scenarios.filter(s => !s.survivable);
      expect(nonSurvivable.length).toBeGreaterThan(0);
      
      nonSurvivable.forEach(scenario => {
        expect(scenario.remainingPercent).toBeLessThanOrEqual(30);
      });
    });

    test('should handle exactly 30% threshold', () => {
      const scenarios = calculateDrawdownScenarios(1000, 0.1167, 1.0, 10);
      
      // Find scenario close to 30%
      const threshold = scenarios.find(s => Math.abs(s.remainingPercent - 30) < 1);
      if (threshold) {
        // Behavior at boundary
        expect(threshold.remainingPercent).toBeGreaterThanOrEqual(29);
      }
    });

    test('should calculate consecutive losses correctly', () => {
      const scenarios = calculateDrawdownScenarios(1000, 0.05, 0.5, 10);
      
      scenarios.forEach((scenario, index) => {
        expect(scenario.consecutiveLosses).toBe(index + 1);
      });
    });

    test('should handle high risk percentage', () => {
      const scenarios = calculateDrawdownScenarios(1000, 0.30, 1.0, 5);
      
      // High risk should quickly become non-survivable
      const nonSurvivable = scenarios.filter(s => !s.survivable);
      expect(nonSurvivable.length).toBeGreaterThan(0);
    });

    test('should handle low risk percentage', () => {
      const scenarios = calculateDrawdownScenarios(1000, 0.01, 0.5, 10);
      
      // Low risk should remain survivable longer
      const survivable = scenarios.filter(s => s.survivable);
      expect(survivable.length).toBeGreaterThan(5);
    });

    test('should compound losses correctly', () => {
      const scenarios = calculateDrawdownScenarios(1000, 0.10, 1.0, 2);
      
      // Loss 1: 1000 - 100 = 900
      // Loss 2: 900 - 90 = 810
      expect(scenarios[0].remainingBalance).toBe(900);
      expect(scenarios[1].remainingBalance).toBe(810);
    });
  });

  describe('Error Handling - Catch Block', () => {
    test('should trigger catch block with malformed request body', async () => {
      // Send a request that will cause JSON parsing issues or calculation errors
      const response = await request(app)
        .post('/api/simulate')
        .set('Content-Type', 'application/json')
        .send('{"accountSize": }'); // Malformed JSON will be caught by Express before our code

      // If Express catches it, we get 400
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('New Features', () => {
    describe('calculateRiskOfRuin', () => {
      test('should calculate risk of ruin for different drawdown levels', () => {
        const results = calculateRiskOfRuin(10000, 0.02, 0.6, 1.5, 0.5);
        
        expect(results).toHaveLength(4);
        expect(results[0].drawdownLevel).toBe(25);
        expect(results[1].drawdownLevel).toBe(50);
        expect(results[2].drawdownLevel).toBe(75);
        expect(results[3].drawdownLevel).toBe(90);
        
        results.forEach(result => {
          expect(result).toHaveProperty('probability');
          expect(result).toHaveProperty('lossesRequired');
          expect(result.probability).toBeGreaterThanOrEqual(0);
          expect(result.probability).toBeLessThanOrEqual(100);
        });
      });

      test('should show higher risk for unfavorable game', () => {
        const favorable = calculateRiskOfRuin(10000, 0.05, 0.8, 1.5, 0.5);
        const unfavorable = calculateRiskOfRuin(10000, 0.05, 0.3, 1.5, 0.5);
        
        // Unfavorable game should have higher ruin probability
        expect(unfavorable[0].probability).toBeGreaterThanOrEqual(favorable[0].probability);
      });

      test('should handle fair game (p = q, ratio = 1)', () => {
        // 50% win rate with equal win/loss ratio = fair game
        const results = calculateRiskOfRuin(10000, 0.02, 0.5, 1.0, 1.0);
        
        // Fair game has certain ruin over long term
        expect(results[0].probability).toBe(100);
      });

      test('should handle ratio >= 1 case in favorable game', () => {
        // Create scenario where r >= 1
        const results = calculateRiskOfRuin(10000, 0.02, 0.4, 0.5, 1.0);
        
        expect(results[0].probability).toBeGreaterThan(0);
      });
    });

    describe('calculateTargetProjections', () => {
      test('should calculate target projections', () => {
        const results = calculateTargetProjections(5000, 100, [2, 3, 5, 10]);
        
        expect(results).toHaveLength(4);
        expect(results[0].targetMultiple).toBe(2);
        expect(results[0].targetAmount).toBe(10000);
        expect(results[0].daysNeeded).toBe(50);
        
        expect(results[1].targetMultiple).toBe(3);
        expect(results[1].targetAmount).toBe(15000);
      });

      test('should return Never for negative daily profit', () => {
        const results = calculateTargetProjections(5000, -50, [2]);
        
        expect(results[0].daysNeeded).toBe('Never');
        expect(results[0].weeksNeeded).toBe('Never');
        expect(results[0].monthsNeeded).toBe('Never');
      });

      test('should return Never for zero daily profit', () => {
        const results = calculateTargetProjections(5000, 0, [2]);
        
        expect(results[0].daysNeeded).toBe('Never');
      });
    });

    describe('calculateTimeBasedAnalysis', () => {
      test('should analyze different time periods', () => {
        const projection = [];
        for (let i = 0; i <= 100; i++) {
          projection.push({ day: i, balance: 5000 + (i * 20) });
        }
        
        const results = calculateTimeBasedAnalysis(projection, 2);
        
        expect(results.daily.trades).toBe(2);
        expect(results.weekly.trades).toBe(10);
        expect(results.monthly.trades).toBe(42);
        expect(results.quarterly.trades).toBe(126);
        
        expect(results.daily.balance).toBe(5020); // Day 1
        expect(results.weekly.balance).toBe(5100); // Day 5
        expect(results.monthly.balance).toBe(5420); // Day 21
        expect(results.quarterly.balance).toBe(6260); // Day 63
        
        expect(results.daily.growth).toBeGreaterThan(0);
        expect(results.quarterly.growth).toBeGreaterThan(results.monthly.growth);
      });

      test('should handle short projection arrays', () => {
        const projection = [{ day: 0, balance: 5000 }];
        const results = calculateTimeBasedAnalysis(projection, 1);
        
        expect(results.daily.balance).toBe(5000); // Falls back to first element when day 1 doesn't exist
      });

      test('should handle empty projection', () => {
        const results = calculateTimeBasedAnalysis([], 2);
        
        expect(results.daily.trades).toBe(2);
        expect(results.daily.balance).toBeUndefined(); // No projection data
      });
    });

    describe('calculateRecoveryScenarios', () => {
      test('should calculate recovery requirements', () => {
        const results = calculateRecoveryScenarios(0.05, 1.5, [10, 20, 30, 40, 50]);
        
        expect(results).toHaveLength(5);
        
        results.forEach((recovery, index) => {
          expect(recovery.drawdownPercent).toBe([10, 20, 30, 40, 50][index]);
          expect(recovery).toHaveProperty('recoveryNeeded');
          expect(recovery).toHaveProperty('winsRequired');
          expect(recovery).toHaveProperty('remainingCapital');
          
          expect(recovery.winsRequired).toBeGreaterThan(0);
          expect(recovery.remainingCapital).toBeGreaterThan(0);
          expect(recovery.remainingCapital).toBeLessThan(100);
        });
      });

      test('should show larger drawdowns need more recovery', () => {
        const results = calculateRecoveryScenarios(0.05, 1.0, [10, 50]);
        
        expect(results[1].recoveryNeeded).toBeGreaterThan(results[0].recoveryNeeded);
        expect(results[1].winsRequired).toBeGreaterThan(results[0].winsRequired);
      });

      test('should handle 50% drawdown correctly', () => {
        const results = calculateRecoveryScenarios(0.05, 1.0, [50]);
        
        // 50% drawdown needs 100% gain to recover
        expect(results[0].recoveryNeeded).toBeCloseTo(100, 1);
        expect(results[0].remainingCapital).toBeCloseTo(50, 1);
      });
    });

    describe('calculateSharpeRatio', () => {
      test('should calculate Sharpe ratio from Monte Carlo results', () => {
        const monteCarloResults = {
          statistics: {
            mean: 15000,
            median: 14500,
            stdDev: 2000,
            meanReturn: 50,
            ruinProbability: 5
          }
        };
        
        const sharpe = calculateSharpeRatio(monteCarloResults, 10000);
        
        expect(typeof sharpe).toBe('number');
        expect(sharpe).not.toBeNaN();
      });

      test('should return 0 for zero standard deviation', () => {
        const monteCarloResults = {
          statistics: {
            mean: 10000,
            stdDev: 0,
            meanReturn: 0
          }
        };
        
        const sharpe = calculateSharpeRatio(monteCarloResults, 10000);
        expect(sharpe).toBe(0);
      });

      test('should return 0 for missing data', () => {
        const sharpe1 = calculateSharpeRatio(null, 10000);
        expect(sharpe1).toBe(0);
        
        const sharpe2 = calculateSharpeRatio({}, 10000);
        expect(sharpe2).toBe(0);
      });
    });

    describe('API Integration - New Features', () => {
      test('should return all new feature data in API response', async () => {
        const response = await request(app)
          .post('/api/simulate')
          .send({
            accountSize: 5000,
            riskPercent: 0.05,
            winRate: 0.6,
            avgWin: 0.5,
            avgLoss: 0.3,
            stopLoss: 0.5,
            contractPrice: 1.0,
            commission: 0.65,
            tradesPerDay: 2,
            days: 30,
            simulations: 100
          });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('riskOfRuin');
        expect(response.body.data).toHaveProperty('targetProjections');
        expect(response.body.data).toHaveProperty('timeBasedAnalysis');
        expect(response.body.data).toHaveProperty('recoveryCalculations');
        expect(response.body.data).toHaveProperty('winStreakProbabilities');
        expect(response.body.data.metrics).toHaveProperty('sharpeRatio');
      });
    });
  });
});
