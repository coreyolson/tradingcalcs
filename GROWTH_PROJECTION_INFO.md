# Growth Projection Explanation

## How It Works

The **Monte Carlo simulation** and growth projections use **percentage-based risk** on your current balance, which means:

### ✅ What It DOES Do:
- **Compounds gains/losses**: Each trade risks a percentage of your current balance
- **Dynamic risk amount**: As your account grows/shrinks, the dollar amount at risk changes
- Example: 
  - Start with $5,000 at 5% risk = $250 per trade
  - After winning and reaching $6,000 → risks $300 per trade
  - After loss down to $4,500 → risks $225 per trade

### ❌ What It DOES NOT Do:
- **Does NOT recalculate contract sizes**: The simulation doesn't track that you'd buy more/fewer contracts as your balance changes
- **Ignores contract minimums**: Real trading has discrete contract sizes (you can't buy 2.5 contracts)
- **Doesn't apply your "Contract Step" setting**: The simulation works in percentage terms, not actual contracts

## Why This Matters

Your **Trade Setup Summary** shows the current contract size based on TODAY's balance:
- If your account grows by 50%, you should recalculate to see you can now trade more contracts
- The Monte Carlo shows you potential balance outcomes, but doesn't show contract size adjustments

## Best Practice

1. **Run initial calculation** to see your current contract size
2. **Review Monte Carlo projections** to understand potential balance ranges
3. **Periodically recalculate** (weekly/monthly) as your balance changes to adjust contract sizes accordingly

## Example Scenario

**Today:**
- Account: $5,000
- Risk: 8% = $400
- Contract size: 4 contracts

**After 30 days (if balance grows to $7,500):**
- You should recalculate:
- New risk: 8% of $7,500 = $600
- New contract size: 6 contracts

The Monte Carlo will show you might reach $7,500, but won't automatically tell you to trade 6 contracts at that point.

## The "Contract Step" Feature

This new parameter rounds your contract size to the nearest multiple:
- **Step of 1**: 4 contracts → 4 contracts (exact)
- **Step of 5**: 4 contracts → 5 contracts (rounded to nearest 5)
- **Step of 10**: 4 contracts → 0 contracts, or 7 contracts → 10 contracts

This helps with:
- Broker minimum lot sizes
- Even position sizing
- Scaling strategies that prefer round numbers
