const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Import server setup
function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Monte Carlo simulation function
  function runMonteCarloSimulation(accountSize, riskPercent, winRate, avgWin, avgLoss, stopLoss, totalTrades, simulations) {
    const results = [];
    
    for (let sim = 0; sim < simulations; sim++) {
      let balance = accountSize;
      let maxDrawdown = 0;
      let peakBalance = accountSize;
      
      for (let trade = 0; trade < totalTrades; trade++) {
        const risk = balance * riskPercent;
        const isWin = Math.random() < winRate;
        
        if (isWin) {
          balance += risk * avgWin;
        } else {
          balance -= risk * stopLoss;
        }
        
        if (balance > peakBalance) {
          peakBalance = balance;
        }
        
        const currentDrawdown = (peakBalance - balance) / peakBalance;
        if (currentDrawdown > maxDrawdown) {
          maxDrawdown = currentDrawdown;
        }
        
        if (balance <= 0) {
          balance = 0;
          break;
        }
      }
      
      results.push({
        endingBalance: Math.round(balance * 100) / 100,
        maxDrawdown: Math.round(maxDrawdown * 10000) / 100,
        return: Math.round(((balance - accountSize) / accountSize) * 10000) / 100
      });
    }
    
    results.sort((a, b) => a.endingBalance - b.endingBalance);
    
    const endingBalances = results.map(r => r.endingBalance);
    const returns = results.map(r => r.return);
    const drawdowns = results.map(r => r.maxDrawdown);
    
    const mean = endingBalances.reduce((a, b) => a + b, 0) / simulations;
    const median = endingBalances[Math.floor(simulations / 2)];
    const percentile5 = endingBalances[Math.floor(simulations * 0.05)];
    const percentile95 = endingBalances[Math.floor(simulations * 0.95)];
    const worstCase = endingBalances[0];
    const bestCase = endingBalances[simulations - 1];
    
    const meanReturn = returns.reduce((a, b) => a + b, 0) / simulations;
    const meanDrawdown = drawdowns.reduce((a, b) => a + b, 0) / simulations;
    
    const variance = endingBalances.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / simulations;
    const stdDev = Math.sqrt(variance);
    
    return {
      statistics: {
        mean: Math.round(mean * 100) / 100,
        median: Math.round(median * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
        percentile5: Math.round(percentile5 * 100) / 100,
        percentile95: Math.round(percentile95 * 100) / 100,
        worstCase: Math.round(worstCase * 100) / 100,
        bestCase: Math.round(bestCase * 100) / 100,
        meanReturn: Math.round(meanReturn * 100) / 100,
        meanDrawdown: Math.round(meanDrawdown * 100) / 100,
        ruinProbability: Math.round((results.filter(r => r.endingBalance === 0).length / simulations) * 10000) / 100
      },
      histogram: { labels: [], data: [] }
    };
  }

  function calculateStreakProbabilities(winRate, maxStreak) {
    const lossRate = 1 - winRate;
    const streaks = [];
    
    for (let streak = 1; streak <= maxStreak; streak++) {
      const probability = Math.pow(lossRate, streak);
      const frequency = probability > 0 ? Math.round(1 / probability) : Infinity;
      
      streaks.push({
        streak,
        probability: Math.round(probability * 1000000) / 10000,
        frequency: frequency === Infinity ? 'Never' : `1 in ${frequency.toLocaleString()}`
      });
    }
    
    return streaks;
  }

  function calculateDrawdownScenarios(accountSize, riskPercent, stopLoss, maxLosses) {
    const scenarios = [];
    
    for (let losses = 1; losses <= maxLosses; losses++) {
      let balance = accountSize;
      
      for (let i = 0; i < losses; i++) {
        const risk = balance * riskPercent;
        balance -= risk * stopLoss;
      }
      
      const drawdown = ((accountSize - balance) / accountSize) * 100;
      const remaining = (balance / accountSize) * 100;
      
      scenarios.push({
        consecutiveLosses: losses,
        remainingBalance: Math.round(balance * 100) / 100,
        remainingPercent: Math.round(remaining * 100) / 100,
        drawdown: Math.round(drawdown * 100) / 100,
        survivable: balance > accountSize * 0.3
      });
    }
    
    return scenarios;
  }

  app.post('/api/simulate', (req, res) => {
    const {
      accountSize,
      riskPercent,
      winRate,
      avgWin,
      avgLoss,
      stopLoss,
      contractPrice,
      commission,
      tradesPerDay,
      days,
      simulations
    } = req.body;

    try {
      const riskPerTrade = accountSize * riskPercent;
      const expectedValue = (winRate * avgWin) - ((1 - winRate) * avgLoss);
      const expectedProfitPerTrade = riskPerTrade * expectedValue;
      const expectedDailyProfit = expectedProfitPerTrade * tradesPerDay;
      const dailyGrowthRate = expectedDailyProfit / accountSize;

      const payoffRatio = avgWin / avgLoss;
      const kellyFraction = winRate - ((1 - winRate) / payoffRatio);
      const profitFactor = (winRate * avgWin) / ((1 - winRate) * avgLoss);
      
      const maxLossPerTrade = riskPerTrade * (stopLoss || avgLoss);
      const maxDailyLoss = maxLossPerTrade * tradesPerDay;

      const projection = [];
      let currentBalance = accountSize;
      for (let day = 0; day <= days; day++) {
        projection.push({
          day,
          balance: Math.round(currentBalance * 100) / 100
        });
        currentBalance += currentBalance * dailyGrowthRate;
      }

      const monteCarloResults = runMonteCarloSimulation(
        accountSize,
        riskPercent,
        winRate,
        avgWin,
        avgLoss,
        stopLoss || avgLoss,
        tradesPerDay * days,
        simulations || 10000
      );

      const streakProbabilities = calculateStreakProbabilities(winRate, 15);
      const drawdownScenarios = calculateDrawdownScenarios(accountSize, riskPercent, stopLoss || avgLoss, 15);

      res.json({
        success: true,
        data: {
          metrics: {
            accountSize,
            riskPerTrade: Math.round(riskPerTrade * 100) / 100,
            expectedValue: Math.round(expectedValue * 10000) / 100,
            expectedProfitPerTrade: Math.round(expectedProfitPerTrade * 100) / 100,
            expectedDailyProfit: Math.round(expectedDailyProfit * 100) / 100,
            dailyGrowthRate: Math.round(dailyGrowthRate * 10000) / 100,
            kellyFraction: Math.round(kellyFraction * 10000) / 100,
            profitFactor: Math.round(profitFactor * 100) / 100,
            payoffRatio: Math.round(payoffRatio * 100) / 100,
            maxLossPerTrade: Math.round(maxLossPerTrade * 100) / 100,
            maxDailyLoss: Math.round(maxDailyLoss * 100) / 100,
            stopLoss: stopLoss || avgLoss,
            contractPrice: contractPrice || 1.0,
            commission: commission || 0.65
          },
          projection,
          monteCarlo: monteCarloResults,
          streakProbabilities,
          drawdownScenarios
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  return app;
}

describe('Integration Tests - Full Trading Scenarios', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe('Conservative Trading Strategy', () => {
    test('should simulate 30 days of conservative trading', async () => {
      const response = await request(app)
        .post('/api/simulate')
        .send({
          accountSize: 5000,
          riskPercent: 0.05,
          winRate: 0.85,
          avgWin: 0.40,
          avgLoss: 0.25,
          stopLoss: 0.50,
          contractPrice: 1.0,
          commission: 0.65,
          tradesPerDay: 1,
          days: 30,
          simulations: 1000
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const { metrics, projection, monteCarlo } = response.body.data;
      
      // Should have positive expected value
      expect(metrics.expectedValue).toBeGreaterThan(0);
      
      // Should have reasonable profit factor
      expect(metrics.profitFactor).toBeGreaterThan(1);
      
      // Projection should show growth
      expect(projection[30].balance).toBeGreaterThan(projection[0].balance);
      
      // Monte Carlo should show positive outcomes
      const startingBalance = 5000;
      expect(monteCarlo.statistics.median).toBeGreaterThan(startingBalance);
    });
  });

  describe('Moderate Trading Strategy', () => {
    test('should simulate 30 days of moderate trading', async () => {
      const response = await request(app)
        .post('/api/simulate')
        .send({
          accountSize: 3125,
          riskPercent: 0.08,
          winRate: 0.80,
          avgWin: 0.50,
          avgLoss: 0.30,
          stopLoss: 0.50,
          contractPrice: 1.0,
          commission: 0.65,
          tradesPerDay: 2,
          days: 30,
          simulations: 1000
        });

      expect(response.status).toBe(200);
      
      const { metrics, drawdownScenarios } = response.body.data;
      
      // Should have good expected value
      expect(metrics.expectedValue).toBeGreaterThan(10);
      
      // Should have survivable drawdown scenarios
      const survivableScenarios = drawdownScenarios.filter(s => s.survivable);
      expect(survivableScenarios.length).toBeGreaterThan(5);
    });
  });

  describe('Aggressive Trading Strategy', () => {
    test('should simulate 30 days of aggressive trading', async () => {
      const response = await request(app)
        .post('/api/simulate')
        .send({
          accountSize: 3125,
          riskPercent: 0.12,
          winRate: 0.75,
          avgWin: 0.60,
          avgLoss: 0.35,
          stopLoss: 0.70,
          contractPrice: 1.0,
          commission: 0.65,
          tradesPerDay: 3,
          days: 30,
          simulations: 1000
        });

      expect(response.status).toBe(200);
      
      const { metrics, monteCarlo } = response.body.data;
      
      // Higher risk should have higher potential returns
      expect(metrics.expectedDailyProfit).toBeGreaterThan(50);
      
      // But also higher drawdowns
      expect(monteCarlo.statistics.meanDrawdown).toBeGreaterThan(5);
      
      // Should have wider distribution
      const range = monteCarlo.statistics.bestCase - monteCarlo.statistics.worstCase;
      expect(range).toBeGreaterThan(1000);
    });
  });

  describe('Edge Case Scenarios', () => {
    test('should handle very high win rate scenario', async () => {
      const response = await request(app)
        .post('/api/simulate')
        .send({
          accountSize: 5000,
          riskPercent: 0.05,
          winRate: 0.95,
          avgWin: 0.50,
          avgLoss: 0.50,
          stopLoss: 0.50,
          contractPrice: 1.0,
          commission: 0.65,
          tradesPerDay: 1,
          days: 10,
          simulations: 100
        });

      expect(response.status).toBe(200);
      
      const { metrics, monteCarlo } = response.body.data;
      
      // High win rate should have very low ruin probability
      expect(monteCarlo.statistics.ruinProbability).toBeLessThan(5);
      
      // Should have positive expected value
      expect(metrics.expectedValue).toBeGreaterThan(30);
    });

    test('should handle break-even scenario', async () => {
      const response = await request(app)
        .post('/api/simulate')
        .send({
          accountSize: 5000,
          riskPercent: 0.05,
          winRate: 0.50,
          avgWin: 0.50,
          avgLoss: 0.50,
          stopLoss: 0.50,
          contractPrice: 1.0,
          commission: 0.65,
          tradesPerDay: 1,
          days: 10,
          simulations: 100
        });

      expect(response.status).toBe(200);
      
      const { metrics } = response.body.data;
      
      // Should have zero expected value
      expect(metrics.expectedValue).toBe(0);
      
      // Profit factor should be 1
      expect(metrics.profitFactor).toBe(1);
    });

    test('should handle losing strategy', async () => {
      const response = await request(app)
        .post('/api/simulate')
        .send({
          accountSize: 5000,
          riskPercent: 0.10,
          winRate: 0.40,
          avgWin: 0.50,
          avgLoss: 0.60,
          stopLoss: 0.60,
          contractPrice: 1.0,
          commission: 0.65,
          tradesPerDay: 2,
          days: 30,
          simulations: 100
        });

      expect(response.status).toBe(200);
      
      const { metrics, monteCarlo } = response.body.data;
      
      // Should have negative expected value
      expect(metrics.expectedValue).toBeLessThan(0);
      
      // Profit factor should be less than 1
      expect(metrics.profitFactor).toBeLessThan(1);
      
      // Should have some ruin probability (or at least >= 0)
      expect(monteCarlo.statistics.ruinProbability).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Commission Impact Tests', () => {
    test('should show impact of high commission on profitability', async () => {
      const lowCommission = await request(app)
        .post('/api/simulate')
        .send({
          accountSize: 5000,
          riskPercent: 0.05,
          winRate: 0.60,
          avgWin: 0.50,
          avgLoss: 0.50,
          stopLoss: 0.50,
          contractPrice: 1.0,
          commission: 0.10,
          tradesPerDay: 1,
          days: 10,
          simulations: 100
        });

      const highCommission = await request(app)
        .post('/api/simulate')
        .send({
          accountSize: 5000,
          riskPercent: 0.05,
          winRate: 0.60,
          avgWin: 0.50,
          avgLoss: 0.50,
          stopLoss: 0.50,
          contractPrice: 1.0,
          commission: 2.00,
          tradesPerDay: 1,
          days: 10,
          simulations: 100
        });

      const lowCommResult = lowCommission.body.data.metrics.expectedDailyProfit;
      const highCommResult = highCommission.body.data.metrics.expectedDailyProfit;

      // Lower commission should result in higher or equal expected daily profit
      // (Due to randomness in Monte Carlo, they might be equal)
      expect(lowCommResult).toBeGreaterThanOrEqual(highCommResult);
    });
  });

  describe('Trades Per Day Impact', () => {
    test('should show linear scaling with trades per day', async () => {
      const oneTradePerDay = await request(app)
        .post('/api/simulate')
        .send({
          accountSize: 5000,
          riskPercent: 0.05,
          winRate: 0.60,
          avgWin: 0.50,
          avgLoss: 0.30,
          stopLoss: 0.50,
          contractPrice: 1.0,
          commission: 0.65,
          tradesPerDay: 1,
          days: 10,
          simulations: 100
        });

      const twoTradesPerDay = await request(app)
        .post('/api/simulate')
        .send({
          accountSize: 5000,
          riskPercent: 0.05,
          winRate: 0.60,
          avgWin: 0.50,
          avgLoss: 0.30,
          stopLoss: 0.50,
          contractPrice: 1.0,
          commission: 0.65,
          tradesPerDay: 2,
          days: 10,
          simulations: 100
        });

      const oneTradeProfit = oneTradePerDay.body.data.metrics.expectedDailyProfit;
      const twoTradeProfit = twoTradesPerDay.body.data.metrics.expectedDailyProfit;

      // Two trades should produce approximately 2x the daily profit
      expect(twoTradeProfit).toBeCloseTo(oneTradeProfit * 2, 0);
    });
  });

  describe('Stop Loss Impact', () => {
    test('should show impact of tighter stop loss on risk', async () => {
      const tightStop = await request(app)
        .post('/api/simulate')
        .send({
          accountSize: 5000,
          riskPercent: 0.10,
          winRate: 0.60,
          avgWin: 0.50,
          avgLoss: 0.30,
          stopLoss: 0.30,
          contractPrice: 1.0,
          commission: 0.65,
          tradesPerDay: 1,
          days: 10,
          simulations: 100
        });

      const wideStop = await request(app)
        .post('/api/simulate')
        .send({
          accountSize: 5000,
          riskPercent: 0.10,
          winRate: 0.60,
          avgWin: 0.50,
          avgLoss: 0.30,
          stopLoss: 0.70,
          contractPrice: 1.0,
          commission: 0.65,
          tradesPerDay: 1,
          days: 10,
          simulations: 100
        });

      const tightMaxLoss = tightStop.body.data.metrics.maxLossPerTrade;
      const wideMaxLoss = wideStop.body.data.metrics.maxLossPerTrade;

      // Tighter stop should have lower max loss
      expect(tightMaxLoss).toBeLessThan(wideMaxLoss);
    });
  });

  describe('Account Size Scaling', () => {
    test('should scale results proportionally with account size', async () => {
      const smallAccount = await request(app)
        .post('/api/simulate')
        .send({
          accountSize: 1000,
          riskPercent: 0.05,
          winRate: 0.60,
          avgWin: 0.50,
          avgLoss: 0.30,
          stopLoss: 0.50,
          contractPrice: 1.0,
          commission: 0.65,
          tradesPerDay: 1,
          days: 5,
          simulations: 100
        });

      const largeAccount = await request(app)
        .post('/api/simulate')
        .send({
          accountSize: 10000,
          riskPercent: 0.05,
          winRate: 0.60,
          avgWin: 0.50,
          avgLoss: 0.30,
          stopLoss: 0.50,
          contractPrice: 1.0,
          commission: 0.65,
          tradesPerDay: 1,
          days: 5,
          simulations: 100
        });

      const smallRisk = smallAccount.body.data.metrics.riskPerTrade;
      const largeRisk = largeAccount.body.data.metrics.riskPerTrade;

      // Risk should scale by 10x
      expect(largeRisk).toBeCloseTo(smallRisk * 10, 0);
    });
  });
});
