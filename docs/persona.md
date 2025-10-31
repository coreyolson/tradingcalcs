# Trader Persona & User Research

## Primary Persona: "Alex - The Disciplined Day Trader"

**Demographics:**
- Age: 28-42
- Experience: 2-5 years actively trading
- Account Size: $10,000 - $50,000
- Trading Style: 0DTE options, futures scalping, swing trades
- Time Commitment: 2-4 hours daily + research
- Technical Proficiency: High (comfortable with APIs, Discord bots, spreadsheets)

**Background:**
Alex left a corporate job (software engineer, finance analyst, or sales) to pursue trading full-time or as a serious side income. They've blown up an account once, learned the hard way about risk management, and now approach trading with data-driven discipline. They use TradingView, ThinkorSwim, or Webull, and are active in trading Discord servers and Twitter FinTwit.

**Pain Points:**
- Overtrading and revenge trading
- Inconsistent position sizing
- Not tracking win rate / expectancy properly
- Emotional decision-making during drawdowns
- Unsure if their edge is real or just variance
- Commission/slippage eating into profits
- Difficulty calculating optimal Kelly %
- Fear of blowing up account again

**Goals:**
- Turn $25k into $100k in 18 months
- Maintain consistency (avoid 20%+ drawdowns)
- Prove to spouse/partner that trading is viable
- Eventually manage OPM (other people's money)
- Build a systematic, rule-based approach

---

## Evaluation Questions - First Visit

### **Initial Impression (0-30 seconds)**
1. "What is this? Another scam trading course landing page?"
   - **Concern:** Credibility, trust, authenticity
   - **Need:** Clear value prop, no BS marketing, no fake testimonials

2. "Is this free or is there a paywall after I enter my email?"
   - **Concern:** Privacy, data collection, hidden costs
   - **Need:** Transparent "100% free, no registration" messaging

3. "Does this work for options? Futures? Just stocks?"
   - **Concern:** Relevance to their trading style
   - **Need:** Clear asset class compatibility in hero section

4. "Why should I trust these calculations? Who built this?"
   - **Concern:** Accuracy, credibility, expertise
   - **Need:** "About" section, methodology docs, open-source GitHub link

### **Feature Discovery (1-3 minutes)**
5. "Can I actually use this for 0DTE SPX spreads?"
   - **Concern:** Real-world applicability
   - **Need:** Specific use cases, examples, presets for 0DTE strategies

6. "Does the Monte Carlo account for slippage and commission?"
   - **Concern:** Realistic projections vs. backtesting lies
   - **Need:** Transparent calculation methodology, adjustable fee inputs

7. "How do I know what win rate and payoff ratio to use?"
   - **Concern:** Garbage in = garbage out
   - **Need:** Guidance on tracking historical stats, journaling integration

8. "Can I save my settings for different strategies?"
   - **Concern:** Efficiency, multiple strategies tracking
   - **Need:** Preset system, localStorage, export/import functionality

9. "What's the difference between Kelly Criterion and Fixed %?"
   - **Concern:** Education, understanding the 'why' not just 'what'
   - **Need:** Tooltips, educational content, clear explanations

10. "Why does it say my Kelly % is 85%? That seems insane."
    - **Concern:** Understanding edge, realistic expectations
    - **Need:** Warnings about over-leverage, fractional Kelly recommendations

### **Deep Dive - Contract Calculator (5-10 minutes)**
11. "What does 'Risk of Ruin: 0%' actually mean?"
    - **Concern:** False confidence, unrealistic expectations
    - **Need:** Clear definitions, when RoR becomes meaningful

12. "My Sharpe Ratio is 2.4 - is that good?"
    - **Concern:** Benchmarking, industry standards
    - **Need:** Comparative metrics, "good/great/excellent" thresholds

13. "How many trades before my Monte Carlo results are reliable?"
    - **Concern:** Sample size, statistical significance
    - **Need:** Minimum trade count guidance, confidence intervals

14. "Can I compare my results to SP500 returns?"
    - **Concern:** Relative performance, opportunity cost
    - **Need:** Benchmark comparisons, risk-adjusted returns context

15. "Why is my Daily Growth 15% but I only made 3% this week?"
    - **Concern:** Reality vs. projection disconnect
    - **Need:** Clear labeling of "expected" vs "actual", variance explanation

### **Position Sizing (Critical Decision Point)**
16. "Should I really risk 4% per trade like the calculator says?"
    - **Concern:** Fear of large drawdowns, emotional capacity
    - **Need:** Risk tolerance questionnaire, psychological considerations

17. "How does Kelly change if I'm trading multiple strategies?"
    - **Concern:** Portfolio-level risk management
    - **Need:** Multi-strategy position sizing, correlation adjustments

18. "What if my stop loss is wider than my entry-to-target distance?"
    - **Concern:** Asymmetric risk/reward setups
    - **Need:** R-multiple calculator, win rate requirements for different R:R

### **Trust & Credibility (Before Committing)**
19. "Has anyone peer-reviewed these formulas?"
    - **Concern:** Mathematical accuracy
    - **Need:** GitHub repo, open-source validation, references

20. "Who made this and why is it free?"
    - **Concern:** Hidden agenda, data harvesting, ulterior motives
    - **Need:** Transparent "About" page, creator credentials, mission statement

21. "Is my data being tracked or sold?"
    - **Concern:** Privacy, competitive intelligence
    - **Need:** Privacy policy, "100% client-side" emphasis, no analytics

22. "Can I use this offline? What if the site goes down?"
    - **Concern:** Reliability, dependency
    - **Need:** Downloadable version, GitHub Pages backup, PWA functionality

### **Comparison Shopping (vs. Alternatives)**
23. "Why use this instead of just Excel?"
    - **Concern:** Effort vs. value
    - **Need:** Speed, visualization, Monte Carlo (hard to do in Excel)

24. "How is this better than PositionSizeCalculator.com?"
    - **Concern:** Feature differentiation
    - **Need:** Unique features (Monte Carlo, Sharpe, multi-calc suite)

25. "Does this integrate with my broker or TradingView?"
    - **Concern:** Workflow friction
    - **Need:** API integrations, CSV import/export

### **Long-Term Value (Will I Return?)**
26. "Can I track my actual performance over time here?"
    - **Concern:** Holistic trading platform vs. one-off tool
    - **Need:** Trade journal, performance tracking, learning from history

27. "Will there be more calculators or is this it?"
    - **Concern:** Product roadmap, investment in tool
    - **Need:** Clear roadmap, "coming soon" features, community feedback

28. "Can I suggest features or report bugs?"
    - **Concern:** Community-driven development, responsiveness
    - **Need:** GitHub Issues, Discord/Twitter presence, feedback form

29. "Is there a mobile app version?"
    - **Concern:** Accessibility, on-the-go usage
    - **Need:** Responsive design, PWA, native app consideration

30. "How do I share this with my trading group?"
    - **Concern:** Social proof, community validation
    - **Need:** Share buttons, Twitter/Discord cards, referral mechanism

---

## Critical Success Factors

### **Must-Haves (Deal Breakers if Missing)**
1. **Accurate Math** - One wrong formula = instant distrust
2. **Fast Performance** - 10k Monte Carlo in <500ms or it feels broken
3. **Mobile Responsive** - 60% of traffic will be mobile
4. **No Registration** - Any friction = bounce
5. **Privacy Guarantees** - Traders are paranoid (rightly so)

### **High-Impact Features (Differentiation)**
1. **Monte Carlo Simulation** - Most calcs don't have this
2. **Multiple Calculator Suite** - One-stop shop vs. scattered tools
3. **Real-Time Calculations** - No "Calculate" button delays
4. **Educational Tooltips** - Learn while using
5. **Sharpe/Kelly/Expectancy** - Metrics serious traders track

### **Nice-to-Haves (Delight Factors)**
1. **Dark Mode** (already have!)
2. **Preset Strategies** (Conservative, Aggressive, etc.)
3. **CSV Export** - For record-keeping
4. **Comparison Tables** - Side-by-side strategy analysis
5. **Keyboard Shortcuts** - Power user efficiency

---

## Red Flags That Would Make Alex Leave

1. **"Sign up to see results"** - Instant close tab
2. **"Premium version for $99/mo"** - Feels like bait-and-switch
3. **Slow loading** - If Monte Carlo takes >3 seconds, seems broken
4. **Mobile not working** - 70% of use is checking on phone
5. **Pushy CTAs** - "Buy my course!" "Join my Discord!" spam
6. **Unrealistic projections** - "Turn $1k into $1M!" nonsense
7. **No sources/references** - Where did these formulas come from?
8. **Broken calculators** - If one doesn't work, trust in all is lost
9. **Ads everywhere** - Feels cheap, questions legitimacy
10. **No clear value prop** - "What is this even for?"

---

## Testimonial Statements (What Alex Would Say if Satisfied)

**After 1st Use:**
> "Finally, a calculator that actually does Monte Carlo. Most tools just give you a single number, but this shows the full distribution. Bookmarked."

**After 1 Week:**
> "I've been using the Position Sizer every morning before placing trades. Realized I was over-leveraging on high-volatility days. Probably saved me a margin call."

**After 1 Month:**
> "The Kelly Criterion calculator opened my eyes. I thought I had an edge, but after plugging in my real win rate, it showed I should be risking way less. Humbling."

**Sharing with Community:**
> "Found this site - zero signup, zero tracking, actually useful. Contract Calculator with Monte Carlo is legit. Check it out: [link]"

**Long-Term User:**
> "I run every new strategy through the Expectancy Calculator before risking real money. Has saved me from several garbage setups. This should be required for every trader."

---

## Feature Requests Alex Would Make

### **High Priority:**
1. "Add a Trade Journal so I can track actual vs. expected performance"
2. "CSV import for bulk position sizing across multiple tickers"
3. "Correlation calculator - I'm trading too many similar positions"
4. "Psychological risk assessment - am I emotionally ready for these swings?"
5. "Win rate decay model - my edge degrades over time, need to model that"

### **Medium Priority:**
6. "Integration with TradingView webhooks"
7. "Broker API connections (TDA, IBKR, Webull)"
8. "Downloadable PDF reports for monthly reviews"
9. "Multi-timeframe analysis (day trading vs. swing vs. long-term)"
10. "Greeks calculator for options spreads"

### **Low Priority:**
11. "Discord bot to query calculations"
12. "Mobile app with push notifications"
13. "Social features - compare anonymized stats with community"
14. "Gamification - badges for consistent risk management"
15. "AI suggestions - 'Your Kelly % is too high for your historical drawdowns'"

---

## Competitor Analysis (What Alex Currently Uses)

### **Current Tools Stack:**
1. **TradingView** - Charting, alerts, backtesting (Premium $60/mo)
2. **Excel/Google Sheets** - Position sizing spreadsheet (free, clunky)
3. **Edgewonk** - Trade journal ($29/mo, overkill for needs)
4. **PositionSizeCalculator.com** - Quick calcs (free, limited)
5. **Reddit/Discord** - Community advice (free, mixed quality)

### **Pain Points with Current Stack:**
- **No integration** - manually copying data between tools
- **Slow** - Excel crashes with large datasets
- **Expensive** - Paying $90+/mo for fragmented tools
- **Limited Monte Carlo** - Most tools assume linear returns
- **No mobile** - Excel on phone is torture

### **Why Copper Candle Could Replace Them:**
- **All-in-one** - Multiple calculators in one place
- **Fast** - Browser-based, instant calculations
- **Free** - No subscription fatigue
- **Mobile-friendly** - Responsive design
- **Privacy-first** - No data sharing concerns
- **Open-source** - Can validate formulas, suggest improvements

---

## Conversion Funnel Analysis

### **Stage 1: Discovery (How Alex Finds This)**
- Google search: "options position size calculator Kelly Criterion"
- Reddit post: r/options, r/Daytrading, r/thetagang
- Twitter/X: FinTwit influencer shares link
- Discord: Trading group member recommends
- YouTube: Trading educator mentions in video

### **Stage 2: Evaluation (First 60 seconds)**
- Scans hero section: "Professional Trading Calculators" ✓
- Checks privacy: "No logins, no tracking" ✓
- Sees Monte Carlo: "10,000 simulations" ✓
- Clicks Contract Calculator (most prominent CTA)

### **Stage 3: Trial (5-10 minutes)**
- Enters default values, hits Calculate
- Sees results, checks if they make sense
- Adjusts inputs, sees real-time updates
- Explores other calculators (Position Sizer, etc.)

### **Stage 4: Adoption Decision**
**Bookmarks if:**
- Results seem accurate
- Fast and responsive
- Works on mobile
- Found something new/valuable

**Leaves if:**
- Slow or broken
- Confusing UI
- Results don't match expectations
- Feels like a lead-gen funnel

### **Stage 5: Retention (Becomes Regular User)**
- Uses before every trading session
- Recommends to trading group
- Provides feedback/feature requests
- Considers donating/supporting

### **Stage 6: Advocacy (Tells Others)**
- Posts on Reddit/Discord with praise
- Tweets about specific feature that helped
- Includes in "tools I use" YouTube video
- Adds to "resources" section of blog

---

## Questions Alex Would Ask After 3 Months of Use

### **Product Evolution:**
1. "When are the 'coming soon' calculators actually launching?"
2. "Can you add [specific feature] I've been manually calculating?"
3. "Have you considered making this open-source so I can contribute?"

### **Community:**
4. "Is there a Discord or forum for users?"
5. "Can I see how other traders are using this?"
6. "Are there case studies or success stories?"

### **Monetization (if ads appear):**
7. "Why are there ads now? I thought this was privacy-focused."
8. "Would you consider a 'supporter' tier to remove ads?"
9. "Can I donate to support development?"

### **Advanced Features:**
10. "Can you add API access so I can automate position sizing?"
11. "Is there a way to backtest strategies with historical data?"
12. "Can multiple people use this collaboratively (trading team)?"

---

## Conclusion: What Alex Really Wants

**Core Need:**
> "I need to know—with data, not gut feel—whether my trading strategy is viable, how much to risk per trade, and what my account will look like in 6 months if I stay disciplined."

**Emotional Need:**
> "I'm terrified of blowing up my account again. I need tools that keep me honest, show me when I'm over-leveraging, and give me confidence that I'm making rational decisions."

**Practical Need:**
> "I don't have time to build Excel models or pay $100/mo for tools. I need something fast, free, accurate, and mobile-friendly that I can check before every trade."

**Trust Requirement:**
> "Show me the math. Let me verify the formulas. Don't track me. Don't sell me a course. Just give me tools that work and treat me like an adult."

---

## Recommended Improvements Based on Persona

### **Immediate (Fix Deal-Breakers):**
1. ✅ Add "Methodology" page explaining all formulas with references
2. ✅ Add "About" page with creator background and mission
3. ✅ Ensure all calculators work perfectly on mobile
4. ✅ Add clear "No tracking, no cookies, no BS" banner

### **Short-Term (Increase Adoption):**
5. ✅ Add tooltips to every input explaining what it means
6. ⚠️ Create "Example Strategies" presets (0DTE, swing, scalping)
7. ⚠️ Add CSV export for all calculators
8. ❌ Implement keyboard shortcuts for power users
9. ⚠️ Add "Share Results" feature (screenshot or link)

### **Medium-Term (Build Loyalty):**
10. ❌ Launch Trade Journal feature to track actual vs. expected
11. ❌ Add correlation calculator for portfolio risk
12. ❌ Build community forum or Discord
13. ❌ Create video tutorials for each calculator
14. ❌ Add "Success Stories" page with anonymized case studies

### **Long-Term (Become Essential):**
15. ❌ API for broker integrations
16. ❌ Mobile app (PWA first, then native)
17. ❌ AI-powered insights ("Your risk is too high for your recent drawdown")
18. ❌ Multi-strategy portfolio optimizer
19. ❌ Historical backtesting with real market data

---

## Actual Website Review - Alex's Findings

### Position Sizer - Grade: B+
**✅ Strengths:**
- Real-time calculations work perfectly
- Quick stats panel (W/L Ratio, EV, Kelly%) is helpful
- Visual highlighting of best method is clever
- Tooltips on every field

**⚠️ Minor Issues:**
- Price Per Unit defaults to $100 (should be $1 or contract value)
- No warning when Kelly > 25% (dangerous for new traders)
- Missing presets (Conservative/Aggressive/Scalper)
- No export functionality

**🔴 Critical Issues:**
- **No explanation of Kelly math** - Alex googles "Kelly Criterion" to verify
- **"Best method" highlight unclear** - Why is it glowing? Tooltip needed
- **Expected Value calculation** - How is this derived? Show formula

**Alex's Action:** Bookmarks but wants methodology docs before trusting for real money

---

### Portfolio Heat - Grade: C+
**✅ Strengths:**
- Good concept execution
- Add position form is intuitive
- Shows recommended 6-8% range

**⚠️ Minor Issues:**
- No visual heat gauge/meter
- Can't sort or filter positions
- No correlation adjustment

**🔴 Critical Issues:**
- **No warning when exceeding max heat** - Just shows red number
- **Manual entry only** - Alex has 15 open positions, not typing all
- **No CSV import/export** - Can't save or bulk load
- **Positions don't persist** - Reload page = gone

**Alex's Action:** Uses once, doesn't return. Goes back to Excel

---

### Risk/Reward Analyzer - Grade: B
**✅ Strengths:**
- Inline R-multiple display is excellent
- Real-time updates feel professional
- Visual diagram helps visualize setup
- Multiple targets supported

**⚠️ Minor Issues:**
- No commission/slippage factored in
- Can't save common setups
- Missing partial exit scaling feature

**🔴 Critical Issues:**
- **No "required win rate" calculator** - For 1:2 R:R, what WR = breakeven?
- **Short position behavior unclear** - Does it flip calculations correctly?
- **% move not shown** - Only dollar amounts, harder to compare across assets

**Alex's Action:** Uses regularly but keeps Excel for commission-adjusted calcs

---

### Leverage Calculator - Grade: B-
**✅ Strengths:**
- Leverage slider is intuitive
- Shows liquidation price clearly
- Supports spot/margin/futures

**⚠️ Minor Issues:**
- Defaults to 10x leverage (scary for beginners)
- No comparison of different leverage levels
- Missing funding rate impact (perpetuals)

**🔴 Critical Issues:**
- **Submit button required** - Should be real-time like others
- **No "What leverage for X% risk?" calculator** - Backwards calculation needed
- **Warning card hidden by default** - High leverage warning should be prominent
- **Cross vs Isolated margin** - Doesn't distinguish

**Alex's Action:** Uses occasionally but prefers broker's calculator (has funding rates)

---

### Trade Expectancy - Grade: A-
**✅ Strengths:**
- Clear expectancy formula shown
- Shows profitability threshold
- Good visualization of edge

**⚠️ Minor Issues:**
- No commission adjustment
- Can't import trade history CSV
- Missing confidence intervals

**🔴 Critical Issues:**
- **No sample size warning** - "Need 100+ trades for significance"
- **Doesn't explain negative expectancy** - Just shows -$X, not "DO NOT TRADE"
- **No comparison to S&P500** - Is my edge worth the risk vs. index?

**Alex's Action:** Uses weekly to validate strategy. Wishes it integrated with journal

---

### Breakeven Calculator - Grade: B+
**✅ Strengths:**
- Simple and focused
- Shows clear breakeven win rate
- Accounts for commissions

**⚠️ Minor Issues:**
- No visual chart/graph
- Missing "trades needed" projection
- Can't save common fee structures

**🔴 Critical Issues:**
- **No explanation of formula** - How is BE calculated? Show math
- **Doesn't factor spread** - Bid/ask spread = hidden cost
- **No comparison table** - Different W/L ratios side-by-side

**Alex's Action:** Uses once to verify Excel formula. Doesn't return

---

### Win Rate Impact - Grade: A
**✅ Strengths:**
- Interactive slider is addictive
- Profitability zones are brilliant
- Sensitivity table very helpful
- Chart updates in real-time

**⚠️ Minor Issues:**
- No commission impact modeled
- Can't adjust for consecutive losses
- Missing Kelly % calculation

**🔴 Critical Issues:**
- **No psychological aspect** - "Can you handle 40% WR emotionally?"
- **Doesn't show drawdown** - High WR doesn't mean no 10-loss streaks
- **No time element** - 50% WR over 10 trades vs 100 trades = different

**Alex's Action:** Uses this constantly. Shares with trading group. Huge hit

---

### Sharpe Ratio - Grade: A-
**✅ Strengths:**
- Multiple input methods (manual, stats, CSV)
- Benchmark comparison
- Additional metrics (Sortino, Calmar)
- Sample data pre-loaded

**⚠️ Minor Issues:**
- CSV upload has no example format
- Benchmark data optional but not clear where to get it
- No export of results

**🔴 Critical Issues:**
- **No "good Sharpe" guidance** - Is 1.5 good? 2.0? 3.0?
- **Interpretation vague** - "Good risk-adjusted performance" - vs what?
- **No SPY auto-import** - Should fetch benchmark data automatically

**Alex's Action:** Uses monthly for performance review. Wishes it tracked history

---

### Drawdown Recovery - Grade: B-
**✅ Strengths:**
- Important topic (Alex's biggest fear)
- Shows math clearly

**⚠️ Minor Issues:**
- Missing trade count estimate
- No time-to-recovery projection
- Can't model partial recovery

**🔴 Critical Issues:**
- **Too simple** - Just shows % needed, not actionable strategy
- **No realistic scenarios** - "20% DD = need 25% return" but over how long?
- **Missing psychological element** - Emotional toll of recovery not addressed

**Alex's Action:** Uses once. Interesting but not actionable

---

### Compound Growth - Grade: B
**✅ Strengths:**
- Clean interface
- Shows compound effect clearly

**⚠️ Minor Issues:**
- No withdrawals/deposits over time
- Missing tax impact
- Can't model variable returns

**🔴 Critical Issues:**
- **Assumes constant returns** - Unrealistic, should use Monte Carlo
- **No drawdown modeling** - Real equity curve has dips
- **No win rate input** - Just assumes flat % return

**Alex's Action:** Cool visualization but knows real trading isn't linear

---

### Time to Goal - Grade: C+
**✅ Strengths:**
- Addresses common question
- Considers multiple factors

**⚠️ Minor Issues:**
- No realistic variance
- Missing drawdown periods
- Can't adjust for learning curve

**🔴 Critical Issues:**
- **Too optimistic** - Assumes perfect consistency
- **No Monte Carlo** - Single projection = misleading
- **Doesn't account for life** - Vacations, sick days, market conditions

**Alex's Action:** Uses once out of curiosity. Doesn't trust single number

---

## Overall Assessment: Would Alex Use Copper Candle?

### Decision: **YES, but with reservations**

**What Made Alex Bookmark:**
1. ✅ Contract Calculator Monte Carlo is legitimately impressive
2. ✅ Win Rate Impact tool is eye-opening and shareable
3. ✅ No login/paywall = instant trust builder
4. ✅ Real-time calculations feel modern and professional
5. ✅ Dark theme doesn't hurt his eyes at 2am

**What Prevents Alex from Fully Committing:**
1. ❌ No methodology/formula documentation = can't verify math
2. ❌ No About page = doesn't know who to trust
3. ❌ Inconsistent UX (some real-time, some submit button)
4. ❌ Missing export functionality = can't keep records
5. ❌ No integration with journal = isolated tool

**What Would Make Alex a Daily User:**
1. 🎯 Add "Methodology" page with all formulas and references
2. 🎯 Add "About" page with creator background and mission
3. 🎯 Make ALL calculators real-time (remove submit buttons)
4. 🎯 Add CSV export to every calculator
5. 🎯 Add preset strategies (Conservative, Aggressive, 0DTE, etc.)

**What Would Make Alex an Evangelist:**
1. 🚀 Trade journal integration (track actual vs expected)
2. 🚀 Open-source GitHub repo (so he can contribute)
3. 🚀 API access (integrate with his Discord bot)
4. 🚀 Mobile PWA (check calcs between meetings)
5. 🚀 Community forum (learn from other traders)

---

## Priority Fixes Based on Alex's Review

### 🔴 URGENT (Breaks Trust):
1. **Add Methodology page** - Show all formulas with academic references
2. **Add About page** - Who made this, why it's free, mission statement
3. **Add Privacy Policy** - "No tracking, client-side only" explicitly stated
4. **Fix inconsistent UX** - All calculators should be real-time
5. **Add sample size warnings** - "Need 30+ trades for statistical significance"

### 🟡 HIGH PRIORITY (Improves Adoption):
6. **Add tooltips explaining calculations** - Not just inputs, but results too
7. **Add export functionality** - CSV download for all calculators
8. **Add preset strategies** - "0DTE SPX", "Swing Trade", "Conservative"
9. **Add commission/slippage** - All calculators should account for fees
10. **Add "good/great/excellent" benchmarks** - For Sharpe, expectancy, etc.

### 🟢 MEDIUM PRIORITY (Increases Retention):
11. **Add comparison tables** - Side-by-side strategy analysis
12. **Add Monte Carlo to simple calcs** - Compound Growth, Time to Goal
13. **Add CSV import** - Bulk position loading, historical returns
14. **Add correlation calculator** - Portfolio-level risk
15. **Add keyboard shortcuts** - Power user efficiency

### 🔵 LOW PRIORITY (Nice to Have):
16. **Add trade journal** - Track actual vs expected over time
17. **Add GitHub integration** - Open-source for validation
18. **Add API endpoints** - Programmatic access
19. **Add mobile PWA** - Installable app
20. **Add community features** - Forum, Discord, case studies

---

*Document Version: 1.1*  
*Last Updated: 2025-10-31*  
*Persona: Alex - The Disciplined Day Trader*  
*Review Status: Live website evaluated calculator-by-calculator*
