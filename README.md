# Trading Risk Calculator

A comprehensive Node.js application for calculating and visualizing trading risk, expectancy, and business model analysis for SPY 0DTE options trading.

## Features

- **Risk Analysis**: Calculate risk per trade, expected value, and profit expectations
- **Business Metrics**: Profit factor, Kelly Fraction, Payoff Ratio, and more
- **Monte Carlo Simulation**: Run 10,000 simulations to analyze potential outcomes
- **Visual Analytics**: Interactive charts showing account growth and probability distributions
- **Loss Streak Analysis**: Calculate probabilities of consecutive losses
- **Drawdown Scenarios**: Analyze account survivability under various loss scenarios
- **Position Sizing Guide**: Automatic scaling recommendations based on account size
- **Data Export**: Export projections to CSV for further analysis

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, Bootstrap 5, Chart.js
- **Styling**: Custom dark mode CSS
- **Icons**: Font Awesome

## Installation

1. Navigate to the project directory:
```bash
cd /Users/coreyolson/Code/Trading
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Production Mode
```bash
npm start
```

### Development Mode (with auto-reload)
```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## Usage

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
