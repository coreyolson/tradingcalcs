const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API endpoint for simulation
app.post('/api/simulate', (req, res) => {
    const {
        accountSize, riskPercent, winRate, avgWin, avgLoss,
        contractPrice, commission, tradesPerDay, days, stopLoss, simulations
    } = req.body;  try {
    // Validate required parameters
    if (!accountSize || accountSize <= 0) {
      throw new Error('Invalid account size');
    }
    if (riskPercent === undefined || riskPercent < 0 || riskPercent > 1) {
      throw new Error('Invalid risk percent (must be between 0 and 100%)');
    }
    if (winRate === undefined || winRate < 0 || winRate > 1) {
      throw new Error('Invalid win rate');
    }
    
    // Calculate basic metrics
    const riskPerTrade = accountSize * riskPercent;
    const expectedValue = (winRate * avgWin) - ((1 - winRate) * avgLoss);
    const expectedProfitPerTrade = riskPerTrade * expectedValue;
    const expectedDailyProfit = expectedProfitPerTrade * tradesPerDay;
    const dailyGrowthRate = expectedDailyProfit / accountSize;

    // Calculate Kelly Fraction
    const payoffRatio = avgWin / avgLoss;
    const kellyFraction = winRate - ((1 - winRate) / payoffRatio);

    // Calculate Profit Factor
    const profitFactor = (winRate * avgWin) / ((1 - winRate) * avgLoss);
    
    // Calculate max loss with stop loss
    const maxLossPerTrade = riskPerTrade * (stopLoss || avgLoss);
    const maxDailyLoss = maxLossPerTrade * tradesPerDay;

    // Generate compounding projection
    const projection = [];
    let currentBalance = accountSize;
    for (let day = 0; day <= days; day++) {
      projection.push({
        day,
        balance: Math.round(currentBalance * 100) / 100
      });
      currentBalance += currentBalance * dailyGrowthRate;
    }

    // Monte Carlo simulation
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

    // Calculate loss streak probabilities
    const streakProbabilities = calculateStreakProbabilities(winRate, 15);

    // Calculate drawdown scenarios with stop loss
    const drawdownScenarios = calculateDrawdownScenarios(accountSize, riskPercent, stopLoss || avgLoss, 15);

    // New features
    const riskOfRuin = calculateRiskOfRuin(accountSize, riskPercent, winRate, avgWin, stopLoss || avgLoss);
    const targetProjections = calculateTargetProjections(accountSize, dailyGrowthRate, [2, 3, 4, 5, 10, 20, 50, 100]);
    const timeBasedAnalysis = calculateTimeBasedAnalysis(projection, tradesPerDay);
    const recoveryCalculations = calculateRecoveryScenarios(riskPercent, avgWin, [10, 20, 30, 40, 50]);
    const sharpeRatio = calculateSharpeRatio(monteCarloResults, accountSize, tradesPerDay * days);
    
    // Calculate expected max loss streak in the given number of trades
    const totalTrades = tradesPerDay * days;
    const expectedMaxLossStreak = calculateExpectedMaxLossStreak(1 - winRate, totalTrades);
    
    // Calculate win streak probabilities (for wins, not losses)
    const winStreakProbabilities = calculateStreakProbabilities(1 - winRate, 15);
    
    const simulationMode = 'stopLoss'; // Will be toggled by frontend

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
          commission: commission || 0.65,
          sharpeRatio: sharpeRatio
        },
        projection,
        monteCarlo: monteCarloResults,
        streakProbabilities,
        drawdownScenarios,
        riskOfRuin,
        targetProjections,
        timeBasedAnalysis,
        recoveryCalculations,
        winStreakProbabilities,
        expectedMaxLossStreak,
        simulationMode
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Monte Carlo Simulation Function
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
        // Use stop loss instead of avg loss
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
  
  // Sort results by ending balance
  results.sort((a, b) => a.endingBalance - b.endingBalance);
  
  // Calculate statistics
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
  
  // Calculate standard deviation
  const variance = endingBalances.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / simulations;
  const stdDev = Math.sqrt(variance);
  
  // Create histogram data (20 bins)
  const histogram = createHistogram(endingBalances, 20);
  
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
    histogram
  };
}

// Create histogram from data
function createHistogram(data, bins) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  
  // Handle edge case where all values are identical
  if (min === max) {
    return {
      labels: [min],
      data: [data.length]
    };
  }
  
  const binSize = (max - min) / bins;
  
  const histogram = Array(bins).fill(0);
  const binLabels = [];
  
  for (let i = 0; i < bins; i++) {
    binLabels.push(Math.round((min + i * binSize) * 100) / 100);
  }
  
  data.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
    histogram[binIndex]++;
  });
  
  // Filter out bins with 0 values
  const filteredLabels = [];
  const filteredData = [];
  
  for (let i = 0; i < bins; i++) {
    if (histogram[i] > 0) {
      filteredLabels.push(binLabels[i]);
      filteredData.push(histogram[i]);
    }
  }
  
  return {
    labels: filteredLabels,
    data: filteredData
  };
}

// Calculate streak probabilities
function calculateStreakProbabilities(winRate, maxStreak) {
  const lossRate = 1 - winRate;
  const streaks = [];
  
  // Helper function to format large numbers with K, M, B abbreviations
  const formatFrequency = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 10000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString();
  };
  
  for (let streak = 1; streak <= maxStreak; streak++) {
    const probability = Math.pow(lossRate, streak);
    const frequency = probability > 0 ? Math.round(1 / probability) : Infinity;
    
    streaks.push({
      streak,
      probability: Math.round(probability * 1000000) / 10000,
      frequency: frequency === Infinity ? 'Never' : `1 in ${formatFrequency(frequency)}`
    });
  }
  
  return streaks;
}

// Calculate drawdown scenarios
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

// 1. Calculate Risk of Ruin (probability of losing X% of account)
function calculateRiskOfRuin(accountSize, riskPercent, winRate, avgWin, stopLoss) {
  const ruinLevels = [10, 20, 30, 40, 50, 60, 75, 90]; // More even progression
  const results = [];
  
  for (const level of ruinLevels) {
    const targetBalance = accountSize * (1 - level / 100);
    const lossesNeeded = Math.ceil(Math.log(targetBalance / accountSize) / Math.log(1 - riskPercent * stopLoss));
    const lossRate = 1 - winRate;
    
    // Simplified gambler's ruin formula approximation
    const q = lossRate;
    const p = winRate;
    const ratio = avgWin / stopLoss;
    
    let ruinProb;
    if (p === q && ratio === 1) {
      ruinProb = 1; // Fair game, ruin is certain
    } else if (p > q) {
      // Favorable game
      const r = (q * ratio) / p;
      ruinProb = r >= 1 ? 1 : Math.pow(r, Math.abs(lossesNeeded));
    } else {
      // Unfavorable game
      ruinProb = 1;
    }
    
    results.push({
      drawdownLevel: level,
      probability: Math.round(Math.min(ruinProb, 1) * 10000) / 100,
      lossesRequired: Math.abs(lossesNeeded)
    });
  }
  
  return results;
}

// 2. Calculate target-based projections
function calculateTargetProjections(accountSize, dailyGrowthRate, targetMultiples) {
  const results = [];
  
  for (const multiple of targetMultiples) {
    const targetAmount = accountSize * multiple;
    
    // Calculate days needed using compounding formula
    // targetAmount = accountSize * (1 + dailyGrowthRate)^days
    // days = log(targetAmount / accountSize) / log(1 + dailyGrowthRate)
    let daysNeeded;
    if (dailyGrowthRate <= 0) {
      daysNeeded = 'Never';
    } else {
      daysNeeded = Math.ceil(Math.log(multiple) / Math.log(1 + dailyGrowthRate));
    }
    
    const profitNeeded = targetAmount - accountSize;
    
    results.push({
      targetMultiple: multiple,
      targetAmount: Math.round(targetAmount * 100) / 100,
      profitNeeded: Math.round(profitNeeded * 100) / 100,
      daysNeeded: daysNeeded === 'Never' ? 'Never' : daysNeeded
    });
  }
  
  return results;
}

// 3. Calculate time-based analysis (daily, weekly, monthly, quarterly)
function calculateTimeBasedAnalysis(projection, tradesPerDay) {
  const analysis = {
    daily: { trades: tradesPerDay },
    weekly: { trades: tradesPerDay * 5 },
    monthly: { trades: tradesPerDay * 21 },
    quarterly: { trades: tradesPerDay * 63 },
    yearly: { trades: tradesPerDay * 252 }
  };
  
  // Calculate expected balances at each time period
  if (projection.length > 0) {
    analysis.daily.balance = projection[Math.min(1, projection.length - 1)]?.balance || 0;
    analysis.weekly.balance = projection[Math.min(5, projection.length - 1)]?.balance || 0;
    analysis.monthly.balance = projection[Math.min(21, projection.length - 1)]?.balance || 0;
    analysis.quarterly.balance = projection[Math.min(63, projection.length - 1)]?.balance || 0;
    analysis.yearly.balance = projection[Math.min(252, projection.length - 1)]?.balance || 0;
    
    const startBalance = projection[0]?.balance || 0;
    analysis.daily.growth = ((analysis.daily.balance - startBalance) / startBalance) * 100;
    analysis.weekly.growth = ((analysis.weekly.balance - startBalance) / startBalance) * 100;
    analysis.monthly.growth = ((analysis.monthly.balance - startBalance) / startBalance) * 100;
    analysis.quarterly.growth = ((analysis.quarterly.balance - startBalance) / startBalance) * 100;
    analysis.yearly.growth = ((analysis.yearly.balance - startBalance) / startBalance) * 100;
  }
  
  return analysis;
}

// 4. Calculate recovery scenarios after drawdowns
function calculateRecoveryScenarios(riskPercent, avgWin, drawdownLevels) {
  const results = [];
  
  for (const drawdown of drawdownLevels) {
    const remainingCapital = 1 - (drawdown / 100);
    const recoveryNeeded = (drawdown / 100) / remainingCapital; // % gain needed to recover
    const winsNeeded = Math.ceil(recoveryNeeded / (riskPercent * avgWin));
    
    results.push({
      drawdownPercent: drawdown,
      recoveryNeeded: Math.round(recoveryNeeded * 10000) / 100,
      winsRequired: winsNeeded,
      remainingCapital: Math.round(remainingCapital * 10000) / 100
    });
  }
  
  return results;
}

// 5. Calculate Sharpe Ratio from Monte Carlo results
function calculateSharpeRatio(monteCarloResults, accountSize, totalTrades) {
  if (!monteCarloResults || !monteCarloResults.statistics) {
    return 0;
  }
  
  const totalReturn = monteCarloResults.statistics.meanReturn / 100;
  const stdDev = monteCarloResults.statistics.stdDev / accountSize; // Normalize by account size
  
  // Assume 5% annual risk-free rate, scale to period
  // Estimate period in years: totalTrades / (252 trading days * 2 trades/day)
  const yearsInPeriod = totalTrades / (252 * 2);
  const riskFreeRate = 0.05 * yearsInPeriod;
  
  if (stdDev === 0) return 0;
  
  const sharpe = (totalReturn - riskFreeRate) / stdDev;
  return Math.round(sharpe * 100) / 100;
}

// Calculate expected maximum loss streak for given number of trades
function calculateExpectedMaxLossStreak(lossRate, totalTrades) {
  // Using the approximation: E[max streak] ≈ log(totalTrades) / log(1/lossRate)
  if (lossRate === 0 || lossRate >= 1) return 0;
  
  const expected = Math.log(totalTrades) / Math.log(1 / lossRate);
  return Math.round(expected);
}

// Export to CSV endpoint
app.post('/api/export-csv', (req, res) => {
  const { data } = req.body;
  
  // Create CSV content
  let csv = 'Day,Balance\n';
  data.projection.forEach(point => {
    csv += `${point.day},${point.balance}\n`;
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=trading-projection.csv');
  res.send(csv);
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export for testing
/* istanbul ignore if */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Trading Risk Calculator running on http://localhost:${PORT}`);
    console.log(`📊 API endpoint available at http://localhost:${PORT}/api/simulate`);
  });
}

module.exports = { 
  app, 
  runMonteCarloSimulation, 
  createHistogram, 
  calculateStreakProbabilities, 
  calculateDrawdownScenarios,
  calculateRiskOfRuin,
  calculateTargetProjections,
  calculateTimeBasedAnalysis,
  calculateRecoveryScenarios,
  calculateSharpeRatio,
  calculateExpectedMaxLossStreak
};
