# Trading Risk Calculator

🎉 **Now 100% Client-Side - No Server Required!**

A comprehensive trading calculator for analyzing risk, expectancy, and business model analysis for SPY 0DTE options trading. Runs entirely in your browser with instant Monte Carlo simulations.

## ✨ Features

- **Risk Analysis**: Calculate risk per trade, expected value, and profit expectations
- **Business Metrics**: Profit factor, Kelly Fraction, Payoff Ratio, Sharpe Ratio
- **Monte Carlo Simulation**: Run 10,000 simulations instantly in your browser
- **Visual Analytics**: Interactive charts showing account growth and probability distributions
- **Loss Streak Analysis**: Calculate probabilities of consecutive losses
- **Drawdown Scenarios**: Analyze account survivability under various loss scenarios
- **Position Sizing Guide**: Automatic scaling recommendations based on account size
- **Interactive Help**: Click question marks for detailed explanations of each metric
- **Preset Management**: Save and load your favorite trading strategies
- **100% Offline**: Works completely offline once loaded

## 🚀 Quick Start

### Option 1: Open Directly (Easiest)
```bash
open public/index.html
```

That's it! No installation needed.

### Option 2: Local Server
```bash
cd public
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Option 3: For Development
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

## 📦 Tech Stack

- **Frontend**: HTML5, Bootstrap 5, Chart.js, Font Awesome
- **Calculations**: Pure JavaScript (Monte Carlo, Kelly Criterion, Risk of Ruin, etc.)
- **Styling**: Custom dark theme with gradient accents
- **No Backend**: Everything runs client-side!

## 🌐 Deployment

Deploy to **free** static hosting in minutes:

**Cloudflare Pages** (Recommended):
1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Set output directory: `public`
4. Deploy! ✅

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions for Cloudflare Pages, Netlify, GitHub Pages, and Vercel.

## 📖 Usage

1. **Configure Parameters**: Enter your trading parameters in the left panel:
   - Account Size
   - Risk Per Trade (%)
   - Win Rate (%)
   - Average Win (%)
   - Average Loss (%)
   - Trades Per Day
   - Projection Period (days)

2. **Calculate**: Click "Calculate Risk" to run the analysis

3. **View Results**: Review the comprehensive metrics, charts, and tables

4. **Export Data**: Click "Export CSV" to download projection data

## API Endpoints

### POST `/api/simulate`
Calculate trading metrics and run Monte Carlo simulation.

**Request Body:**
```json
{
  "accountSize": 3125,
  "riskPercent": 0.08,
  "winRate": 0.8,
  "avgWin": 0.5,
  "avgLoss": 0.3,
  "tradesPerDay": 2,
  "days": 30,
  "simulations": 10000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": { ... },
    "projection": [ ... ],
    "monteCarlo": { ... },
    "streakProbabilities": [ ... ],
    "drawdownScenarios": [ ... ]
  }
}
```

## Default Trading Model

- **Instrument**: SPY 0DTE Options
- **Position Size**: 5 contracts per trade
- **Account**: $3,125 (starter)
- **Risk Model**: 8% per trade
- **Stop Loss**: 50% of premium
- **Win Rate**: 80%
- **Average Win**: +50%
- **Average Loss**: -30%
- **Expected Value**: +34%

## Key Formulas

### Expected Value (EV)
```
EV = (WinRate × AvgWin) - (LossRate × AvgLoss)
```

### Expected Profit Per Trade
```
Profit = RiskPerTrade × EV
```

### Kelly Fraction
```
Kelly = WinRate - (LossRate / PayoffRatio)
```

### Profit Factor
```
ProfitFactor = (WinRate × AvgWin) / (LossRate × AvgLoss)
```

## File Structure

```
/Trading
├── package.json
├── server.js
├── README.md
├── /docs
│   └── instructions.md
└── /public
    ├── index.html
    ├── style.css
    └── app.js
```

## Features in Detail

### Monte Carlo Simulation
- Runs 10,000 random trade sequences
- Shows distribution of possible outcomes
- Calculates mean, median, percentiles
- Identifies worst and best case scenarios
- Displays probability of account ruin

### Loss Streak Analysis
- Calculates probability of consecutive losses
- Shows frequency of occurrence
- Highlights critical streak levels

### Drawdown Scenarios
- Models account balance after consecutive losses
- Marks survivable vs critical levels
- Uses actual risk-per-trade calculations

### Position Sizing
- Automatic scaling based on account size
- Each $3,125 = 1 new 5-lot block
- Maintains 8% risk rule across scales

## Browser Support

- Chrome/Brave (recommended)
- Firefox
- Safari
- Edge

## Performance

- Instant calculations
- Real-time chart updates
- Optimized Monte Carlo simulations
- Responsive design for all devices

## Future Enhancements

- [ ] Cash vs Margin account toggle
- [ ] Recovery time calculations
- [ ] Multiple strategy comparison
- [ ] Historical backtest integration
- [ ] Real-time market data integration
- [ ] Trade journal integration
- [ ] Advanced variance analysis

## Author

**Corey Olson**

## Version

1.0.0

## License

MIT

## Support

For issues or questions, please refer to the documentation in `/docs/instructions.md`
