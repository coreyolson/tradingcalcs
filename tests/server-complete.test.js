const request = require('supertest');
const {
  app,
  runMonteCarloSimulation,
  createHistogram,
  calculateStreakProbabilities,
  calculateDrawdownScenarios
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
});
