# Calculator Robustness Improvements

## Completed (with full error handling)

### ✅ Position Sizer Calculator
- Input validation for all fields (positive values, valid ranges 0-100%)
- Kelly Criterion edge validation (negative edge = 0)
- Division by zero protection (avgLoss cannot be 0)
- Position size sanity checks (max 10x account warning)
- NaN/Infinity protection for all calculations
- User-friendly error messages with specific issues list

### ✅ Portfolio Heat Calculator  
- Input validation for all position fields
- Prevent adding positions with zero/negative values
- Stop loss cannot equal entry price check
- Position risk cannot exceed account balance validation
- Account balance and max heat percentage validation
- Chart rendering validation (skip rendering if invalid data)
- NaN/Infinity protection for heat calculations

### ✅ Risk/Reward Calculator
- Validate all inputs (entry, stop, target, size, account > 0)
- Check for zero-risk scenarios (stop = entry)
- Check for zero-reward scenarios (target = entry)
- Validate long/short position logic (stop must be below entry for longs, above for shorts)
- Division by zero protection in R:R calculations
- NaN/Infinity guards in all calculations
- Breakeven win rate calculations protected

## Remaining Calculators To Audit

### 🔄 Leverage Calculator
**Edge Cases:**
- Zero margin → division by zero
- Unrealistic leverage (500x+) → warning needed
- Negative values → reject
- Position value exceeding reasonable limits → warning
- Liquidation price calculations with extreme leverage

**Required Fixes:**
- Add input validation (all values > 0)
- Add leverage reasonableness warning (>50x = extremely risky)
- Validate liquidation price calculations don't produce NaN
- Add position size vs account balance sanity check

### 🔄 Trade Expectancy Calculator
**Edge Cases:**
- Win rate 0% or 100% → special messaging
- Win rate >100% or <0% → reject
- Negative avg win/loss → reject
- Avg win < avg loss with high win rate → still can be positive expectancy

**Required Fixes:**
- Input validation (win rate 0-100%, avg win/loss > 0)
- Handle 0% win rate (expectancy = -avgLoss)
- Handle 100% win rate (expectancy = avgWin)
- Clear messaging when expectancy is negative ("losing strategy")

### 🔄 Breakeven Calculator
**Edge Cases:**
- Current win rate at 0% or 100% → may be impossible to reach breakeven
- Average win = average loss (1:1 R:R) → need exactly 50% win rate
- Negative values → reject
- Impossible scenarios (e.g., 10% win rate, 1:5 R:R → breakeven impossible)

**Required Fixes:**
- Input validation (all positive, win rate 0-100%)
- Calculate if breakeven is mathematically possible
- Show "Breakeven impossible with these parameters" when needed
- Validate against >100% win rate requirement

### 🔄 Win Rate Impact Calculator
**Edge Cases:**
- Win rates >100% or <0% → reject
- Negative trade counts → reject
- Zero total trades → division by zero
- Extreme win rate changes (0% → 100%) → validate realistic

**Required Fixes:**
- Input validation (win rates 0-100%, trades > 0)
- Prevent division by zero when total trades = 0
- Chart validation before rendering
- Percentage calculation protection

### 🔄 Sharpe Ratio Calculator
**Edge Cases:**
- Zero or negative standard deviation → division by zero
- All returns identical → std dev = 0 → Sharpe undefined
- Extreme return values → validate reasonableness
- Risk-free rate > average return → negative Sharpe (valid but needs explanation)

**Required Fixes:**
- Input validation (all numeric, reasonable ranges)
- Check for std dev = 0 → show "No volatility - Sharpe undefined"
- Handle negative Sharpe with explanation
- Validate returns array before calculation

### 🔄 Compound Growth Calculator
**Edge Cases:**
- Growth rate >1000% or <-100% → unrealistic or account death
- Zero starting balance → reject
- Negative starting balance → reject
- Unrealistic timeframes (1000 years) → warning
- -100% growth rate → account goes to $0

**Required Fixes:**
- Input validation (starting balance > 0, timeframe > 0)
- Warning for growth rate <-50% ("unsustainable drawdown")
- Warning for growth rate >100% ("extremely rare, verify calculations")
- Prevent chart explosion with compound calculations (cap at reasonable max)
- Handle -100% growth rate (account = $0)

### 🔄 Drawdown Recovery Calculator
**Edge Cases:**
- 100% drawdown → unrecoverable (division by zero: gain needed = Infinity)
- Negative drawdown values → reject
- >100% drawdown → impossible scenario
- Zero peak value → division by zero

**Required Fixes:**
- Input validation (peak > 0, drawdown 0-100%)
- Special case for 100% drawdown: "Account is at $0 - unrecoverable"
- Special case for >99% drawdown: "Requires X,XXX% gain - practically unrecoverable"
- Show warning for >50% drawdown: "Requires X% gain - very difficult"

### 🔄 Time to Goal Calculator
**Edge Cases:**
- Goal < starting balance → already achieved
- Zero or negative growth rate → goal never reached
- Unrealistic targets ($1K → $1M in 1 month) → warning
- Zero starting balance → reject
- Negative growth with positive goal → impossible

**Required Fixes:**
- Input validation (starting > 0, goal > 0, growth rate input)
- Check if goal already met: "Goal already achieved!"
- Check if mathematically impossible (negative growth to higher goal): "Goal unreachable with negative growth"
- Calculate and warn if timeframe is unrealistic (>50 years: "Extremely long timeframe")
- Prevent logarithm of zero/negative numbers

## Error Handling Patterns Used

### Standard Validation Template
```javascript
function calculate() {
    const val1 = parseFloat(document.getElementById('input1').value);
    const val2 = parseFloat(document.getElementById('input2').value);
    
    // Validation array
    const errors = [];
    if (!val1 || val1 <= 0) errors.push('Input 1 must be greater than 0');
    if (!val2 || val2 <= 0) errors.push('Input 2 must be greater than 0');
    
    // Early return if errors
    if (errors.length > 0) {
        showError(errors);
        return;
    }
    
    clearError();
    
    // ... calculations with NaN checks
    if (!isFinite(result) || isNaN(result)) {
        showError(['Invalid calculation result']);
        return;
    }
    
    // ... display results
}
```

### Error Display Functions
```javascript
function showError(errors) {
    const container = document.getElementById('errorContainer') || createErrorContainer();
    container.innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Invalid Input</strong>
            <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem;">
                ${errors.map(err => `<li>${err}</li>`).join('')}
            </ul>
        </div>
    `;
    container.style.display = 'block';
}

function clearError() {
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) errorContainer.style.display = 'none';
}

function createErrorContainer() {
    const container = document.createElement('div');
    container.id = 'errorContainer';
    container.style.display = 'none';
    const form = document.getElementById('calculatorForm');
    form.parentElement.insertBefore(container, form.nextSibling);
    return container;
}
```

## Testing Checklist

For each calculator, test:
- [ ] All inputs = 0
- [ ] All inputs = negative
- [ ] Division by zero scenarios
- [ ] Extreme values (very large/small)
- [ ] Invalid percentages (>100%, <0%)
- [ ] Special cases (100% drawdown, 0% win rate, etc.)
- [ ] NaN/Infinity results
- [ ] Chart rendering with bad data
- [ ] Empty inputs (form not filled)

## Code Cleanup Completed

- ✅ Removed `views/about-old.ejs`
- ✅ Removed `views/methodology-old.ejs`
- ✅ Removed `views/index-backup.ejs`
- ✅ Removed `views/index-bad.ejs`
- ✅ Removed `public/index-original.html`

## Next Steps

1. ✅ Position Sizer - DONE
2. ✅ Portfolio Heat - DONE  
3. ✅ Risk/Reward - DONE
4. 🔄 Leverage Calculator
5. 🔄 Trade Expectancy
6. 🔄 Breakeven Calculator
7. 🔄 Win Rate Impact
8. 🔄 Sharpe Ratio
9. 🔄 Compound Growth
10. 🔄 Drawdown Recovery
11. 🔄 Time to Goal

## Performance Considerations

- All calculations run client-side (no server load)
- Error validation happens before heavy calculations
- Chart rendering skipped if data is invalid
- No memory leaks from error containers (reuse existing)

## User Experience Improvements

- Errors shown inline near the form
- Clear, specific error messages (no generic "invalid input")
- Warnings for questionable-but-valid inputs (e.g., 200% leverage)
- Results cleared to "--" when errors present
- No console errors visible to users
