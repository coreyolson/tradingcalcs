


# Trading Business Model Calculator — AI Agent Instructions

## Purpose
This project models a trading strategy as a business model. It calculates expectancy, risk, variance, and compounding outcomes for SPY 0DTE option trading with configurable parameters. The goal is to visualize trading as a repeatable business with controlled risk and predictable expectancy.

---

## Core Trading Model

**Instrument:** SPY 0DTE options  
**Typical Trade:** 5 contracts per position, priced ~$0.80–$1.25  
**Account Example:** $3,125 (cash account)  
**Risk Model:** 8% of total account per trade (~$250 risk)  
**Stop Loss:** 50% of premium  
**Win Rate:** 80% (historical average, ~300 trades tested)  
**Average Win:** +50%  
**Average Loss:** –30%  
**Expected Value (EV):**  
EV = (WinRate × AvgWin) − (LossRate × AvgLoss)  
EV = (0.8 × 0.5) − (0.2 × 0.3) = **+0.34 (34%)**

### Per-Trade Expectancy
- Risk per trade: $250  
- Expected gain: $250 × 0.34 = **$85 per trade**

### Daily Expectancy
- With 1 trade/day → +$85/day → +2.7% daily growth on $3,125 account  
- With 2 trades/day → +$170/day → +5.4% daily growth  
- With 3 trades/day → +$255/day → +8.1% daily growth

### Cash Account Note
A cash account can take multiple trades per day as long as each uses settled funds. Each $500 trade consumes a “bucket” of settled cash until the next day (T+1).  
For $3,250, that supports ~6 trades/day if each costs ~$500.

---

## Risk & Drawdown Modeling

| Consecutive Losses | Remaining Account % (8% risk per trade) | Survives? |
|---------------------|------------------------------------------|------------|
| 8 | 51% | ✅ survivable |
| 9 | 47% | ✅ survivable |
| 10 | 43% | ✅ survivable |
| 11 | 40% | ✅ survivable |

### Streak Probabilities (80% win rate)
| Streak | Probability | Frequency |
|---------|-------------|------------|
| 8 losses | 0.000256% | 1 in 390,000 |
| 9 losses | 0.000051% | 1 in 2 million |
| 10 losses | 0.000010% | 1 in 10 million |

### Typical Win Streaks
| Streak | Probability | Notes |
|---------|--------------|-------|
| 5 wins | 32.8% | Common |
| 6 wins | 26% | Frequent |
| 7 wins | 21% | Monthly occurrence |
| 10 wins | 10.7% | Rare but possible |

---

## Scaling Framework

Each +$3,125 in equity adds one new 5-lot block safely under the 8% rule.

| Account | 5-Lot Blocks | Total Risk/Trade | Expected $/Trade |
|----------|---------------|------------------|------------------|
| $3,125 | 1 | $250 | $85 |
| $6,250 | 2 | $500 | $170 |
| $9,375 | 3 | $750 | $255 |
| $12,500 | 4 | $1,000 | $340 |
| $15,625 | 5 | $1,250 | $425 |

---

## Website Build Instructions

### Tech Stack
- **Frontend:** Bootstrap 5, Font Awesome, Chart.js  
- **Files:**  
  - `index.html` — layout and input form  
  - `style.css` — dark theme, responsive  
  - `app.js` — calculations, interactivity  
- **Design:** dark mode, smooth hover animations, mobile-friendly

### Functionality
User inputs:
- Account size  
- Risk %  
- Win rate  
- Avg win %  
- Avg loss %  
- Trades per day  

App outputs:
- Risk per trade ($)  
- Expected value (EV)  
- Expected profit per trade/day/month  
- Growth curve (Chart.js)  
- Drawdown & streak probabilities  
- Position sizing recommendation  

### Core Formulas (JavaScript)
```js
let account = 3250;
let riskPct = 0.08;
let winRate = 0.8;
let avgWin = 0.5;
let avgLoss = 0.3;
let tradesPerDay = 2;

let riskPerTrade = account * riskPct;
let EV = (winRate * avgWin) - ((1 - winRate) * avgLoss);
let expectedProfitPerTrade = riskPerTrade * EV;
let expectedDailyProfit = expectedProfitPerTrade * tradesPerDay;
let dailyGrowthPct = expectedProfitPerTrade / account * 100;
```

### UI Components
- **📈 Profit & Growth Card** — shows EV, daily % growth, and profit per day  
- **⚖️ Risk Management Card** — displays per-trade risk and loss tolerance  
- **🎯 Expectancy Breakdown Card** — shows EV formula and intermediate steps  
- **📉 Loss Streak Probability Card** — simulates worst-case streaks  
- **🧮 Position Sizing Card** — helps calculate number of 5-lot blocks  

### Graphs
- **Chart 1:** Projected 30-day compounding  
- **Chart 2:** Probability of consecutive losses  

---

## Agent Goals

The agent should:
1. Generate and maintain the full web calculator.
2. Make all formulas configurable from a central state.
3. Display results instantly as user changes inputs.
4. Export simulation data to CSV.
5. Keep styling minimal and professional (dark mode).

---

## Future Additions
- Add toggle between *cash account* and *margin account* behavior.
- Include expected recovery time from drawdown.
- Add Monte Carlo variance visualization.
- Support API endpoint for data export (`/api/simulate`).

---

---

## Project Metadata
```yaml
project: Trading Business Model Calculator
author: Corey Olson
language: JavaScript (Bootstrap / Chart.js)
category: Financial Modeling
purpose: Visualize expectancy, risk, compounding, and streak variance for trading systems
version: 1.0.0
```

---

## Setup & Run

### Prerequisites
- Node.js (for local development server)
- Modern browser (Chrome or Brave recommended)
- Internet connection (Bootstrap, Font Awesome CDN)

### Quick Start
```bash
git clone https://github.com/coreyolson/trading-calculator.git
cd trading-calculator
npx serve .
```
Open **http://localhost:3000** to view the calculator.

---

## Additional Business Metrics

### Key Ratios
- **Profit Factor** = (WinRate × AvgWin) / (LossRate × AvgLoss)
- **Payoff Ratio** = AvgWin / AvgLoss
- **Kelly Fraction** = WinRate − (LossRate / PayoffRatio)
- **Sharpe Ratio** = (ExpectedReturn − RiskFreeRate) / StdDev

### Business Framing
These metrics translate trading performance into a business analysis model—viewing each trade as a unit of production, each streak as variance, and expectancy as margin.

---

## Monte Carlo Simulation

Simulate **10,000 random trade sequences** using user-defined win rate and loss parameters.

Outputs:
- Distribution of ending balances
- Median vs 5th percentile account values
- Worst drawdown probability
- Histogram chart of possible outcomes

Implementation:
- Generate random wins/losses based on winRate
- Accumulate PnL per trial
- Display mean, median, 95% confidence bands in Chart.js histogram

---

## JSON Schema

Example input/output data structure for future API or local storage:

```json
{
  "account_size": 3125,
  "risk_percent": 0.08,
  "win_rate": 0.8,
  "avg_win": 0.5,
  "avg_loss": 0.3,
  "trades_per_day": 2,
  "days": 20,
  "expected_value": 0.34,
  "expected_profit_per_trade": 85,
  "expected_daily_profit": 170,
  "expected_growth_rate": 0.054
}
```

---

## Example Scenarios

| Scenario | Description | Expected Result |
|-----------|--------------|----------------|
| Starter Account | $3,125, 1 trade/day | +$85/day, 2.7% growth |
| Scaling Phase | $9,375, 3 trades/day | +$255/day, 8.1% growth |
| Full Operation | $15,625, 5 trades/day | +$425/day, 13.6% growth |
| Stress Test | 8-loss streak | 51% drawdown, survivable |

---

## File Architecture

```
/project-root
│
├── /docs
│   └── instructions.md
├── /public
│   ├── index.html
│   ├── style.css
│   └── app.js
└── /assets
    └── charts.js
```

---

## Data Export / API Integration

### Planned Features
- **Download CSV** — export all calculated metrics and simulation results
- **API endpoint** — `/api/simulate` for remote or automated modeling
- **LocalStorage** — persist last-used inputs for continuity
- **Export JSON** — share configuration snapshots between users

---

## Summary

This document now serves as a full developer/agent specification for the **Trading Business Model Calculator**, covering:
- Core expectancy logic  
- Risk and drawdown modeling  
- Statistical simulation  
- Frontend implementation  
- Future data and API integrations  

End of extended specification.