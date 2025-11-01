/**
 * Copper Candle - Personalization Engine
 * Stores and manages user trading metrics for personalized calculator experiences
 * Uses localStorage for persistence across sessions (no cookies, no tracking)
 */

const PersonalizationEngine = (() => {
    const STORAGE_KEY = 'copperCandle_userProfile';
    
    // Default user profile structure
    const DEFAULT_PROFILE = {
        // Basic Trading Info
        accountSize: null,
        riskPercentPerTrade: 2, // Conservative default
        
        // Performance Metrics
        winRate: null,
        avgWin: null,
        avgLoss: null,
        totalTrades: 0,
        
        // Trading Style
        tradingStyle: null, // 'scalper', 'day', 'swing', 'position'
        timeframe: null, // '1m', '5m', '15m', '1h', '4h', '1d'
        tradesPerDay: null,
        
        // Risk Profile
        riskProfile: 'conservative', // 'conservative', 'moderate', 'aggressive'
        maxPositionSize: null,
        maxPortfolioHeat: 8, // Conservative default (6-8%)
        
        // Goals
        targetMonthlyReturn: null,
        accountGoal: null,
        timeHorizon: null, // months
        
        // Preferences
        showWelcome: true,
        preferredCalculators: [],
        lastUsedCalculator: null,
        calculatorUsageCount: {},
        
        // Metadata
        createdAt: null,
        lastUpdated: null,
        version: '1.0'
    };
    
    /**
     * Load user profile from localStorage
     */
    function loadProfile() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return { ...DEFAULT_PROFILE };
            }
            
            const profile = JSON.parse(stored);
            // Merge with defaults to handle version updates
            return { ...DEFAULT_PROFILE, ...profile };
        } catch (error) {
            console.error('Error loading user profile:', error);
            return { ...DEFAULT_PROFILE };
        }
    }
    
    /**
     * Save user profile to localStorage
     */
    function saveProfile(profile) {
        try {
            profile.lastUpdated = new Date().toISOString();
            if (!profile.createdAt) {
                profile.createdAt = profile.lastUpdated;
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
            
            // Dispatch custom event for components to react to profile changes
            window.dispatchEvent(new CustomEvent('profileUpdated', { detail: profile }));
            
            return true;
        } catch (error) {
            console.error('Error saving user profile:', error);
            return false;
        }
    }
    
    /**
     * Update specific profile fields
     */
    function updateProfile(updates) {
        const profile = loadProfile();
        const updatedProfile = { ...profile, ...updates };
        return saveProfile(updatedProfile) ? updatedProfile : profile;
    }
    
    /**
     * Check if user has set up their profile
     */
    function isProfileComplete() {
        const profile = loadProfile();
        return !!(profile.accountSize && profile.winRate && profile.avgWin && profile.avgLoss);
    }
    
    /**
     * Get profile completeness percentage
     */
    function getProfileCompleteness() {
        const profile = loadProfile();
        const requiredFields = [
            'accountSize', 'riskPercentPerTrade', 'winRate', 'avgWin', 'avgLoss',
            'tradingStyle', 'tradesPerDay', 'riskProfile'
        ];
        
        const completedFields = requiredFields.filter(field => 
            profile[field] !== null && profile[field] !== undefined
        ).length;
        
        return Math.round((completedFields / requiredFields.length) * 100);
    }
    
    /**
     * Get personalized recommendations based on profile
     */
    function getRecommendations() {
        const profile = loadProfile();
        const recommendations = [];
        
        // Check if profile is empty
        if (!profile.accountSize) {
            recommendations.push({
                type: 'setup',
                priority: 'high',
                title: 'Complete Your Profile',
                message: 'Set up your trading metrics to get personalized recommendations across all calculators.',
                action: 'setupProfile',
                icon: 'fa-user-circle'
            });
            return recommendations;
        }
        
        // Risk Management Recommendations
        if (profile.riskPercentPerTrade > 3) {
            recommendations.push({
                type: 'risk',
                priority: 'high',
                title: 'High Risk Per Trade',
                message: `You're risking ${profile.riskPercentPerTrade}% per trade. Consider reducing to 1-2% to protect your capital.`,
                action: 'adjustRisk',
                icon: 'fa-exclamation-triangle'
            });
        }
        
        // Win Rate vs Risk/Reward Balance
        if (profile.winRate && profile.avgWin && profile.avgLoss) {
            const riskRewardRatio = profile.avgWin / profile.avgLoss;
            const breakeven = profile.avgLoss / (profile.avgWin + profile.avgLoss);
            
            if (profile.winRate < breakeven * 100) {
                recommendations.push({
                    type: 'performance',
                    priority: 'high',
                    title: 'Below Breakeven Win Rate',
                    message: `Your ${profile.winRate}% win rate is below the ${(breakeven * 100).toFixed(1)}% needed to breakeven with your current risk/reward.`,
                    action: 'viewBreakeven',
                    icon: 'fa-chart-line'
                });
            }
            
            // Kelly Criterion Check
            const kellyPercent = ((riskRewardRatio * (profile.winRate / 100)) - ((100 - profile.winRate) / 100)) / riskRewardRatio;
            if (kellyPercent < 0) {
                recommendations.push({
                    type: 'strategy',
                    priority: 'critical',
                    title: 'Negative Edge Detected',
                    message: 'Your current strategy has a negative mathematical expectancy. Review your trade expectancy calculator.',
                    action: 'viewExpectancy',
                    icon: 'fa-exclamation-circle'
                });
            }
        }
        
        // Sample Size Warnings
        if (profile.totalTrades < 30) {
            recommendations.push({
                type: 'data',
                priority: 'medium',
                title: 'Limited Sample Size',
                message: `You have ${profile.totalTrades} trades recorded. Need 30+ for statistical significance.`,
                action: 'updateTrades',
                icon: 'fa-database'
            });
        }
        
        // Goal Progress
        if (profile.accountGoal && profile.accountSize) {
            const progress = (profile.accountSize / profile.accountGoal) * 100;
            if (progress < 25) {
                recommendations.push({
                    type: 'goal',
                    priority: 'low',
                    title: 'Goal Progress',
                    message: `You're ${progress.toFixed(1)}% of the way to your $${profile.accountGoal.toLocaleString()} goal.`,
                    action: 'viewTimeToGoal',
                    icon: 'fa-flag-checkered'
                });
            }
        }
        
        return recommendations;
    }
    
    /**
     * Get personalized calculator defaults
     */
    function getCalculatorDefaults(calculatorType) {
        const profile = loadProfile();
        const defaults = {};
        
        // Common fields
        if (profile.accountSize) defaults.accountSize = profile.accountSize;
        if (profile.riskPercentPerTrade) defaults.riskPercent = profile.riskPercentPerTrade;
        if (profile.winRate) defaults.winRate = profile.winRate;
        if (profile.avgWin) defaults.avgWin = profile.avgWin;
        if (profile.avgLoss) defaults.avgLoss = profile.avgLoss;
        if (profile.tradesPerDay) defaults.tradesPerDay = profile.tradesPerDay;
        
        // Calculator-specific defaults
        switch (calculatorType) {
            case 'position-sizer':
                if (profile.riskPercentPerTrade) defaults.riskPerTrade = profile.riskPercentPerTrade;
                break;
                
            case 'portfolio-heat':
                if (profile.maxPortfolioHeat) defaults.maxHeat = profile.maxPortfolioHeat;
                break;
                
            case 'compound-growth':
                if (profile.targetMonthlyReturn) defaults.monthlyReturn = profile.targetMonthlyReturn;
                break;
                
            case 'time-to-goal':
                if (profile.accountGoal) defaults.goalAmount = profile.accountGoal;
                if (profile.timeHorizon) defaults.timeHorizon = profile.timeHorizon;
                break;
        }
        
        return defaults;
    }
    
    /**
     * Track calculator usage
     */
    function trackCalculatorUsage(calculatorName) {
        const profile = loadProfile();
        
        profile.lastUsedCalculator = calculatorName;
        
        if (!profile.calculatorUsageCount[calculatorName]) {
            profile.calculatorUsageCount[calculatorName] = 0;
        }
        profile.calculatorUsageCount[calculatorName]++;
        
        saveProfile(profile);
    }
    
    /**
     * Get most used calculators
     */
    function getMostUsedCalculators(limit = 3) {
        const profile = loadProfile();
        const usage = profile.calculatorUsageCount || {};
        
        return Object.entries(usage)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([name, count]) => ({ name, count }));
    }
    
    /**
     * Reset profile to defaults
     */
    function resetProfile() {
        if (confirm('Are you sure you want to reset your profile? This will clear all your saved metrics.')) {
            localStorage.removeItem(STORAGE_KEY);
            window.dispatchEvent(new CustomEvent('profileReset'));
            return true;
        }
        return false;
    }
    
    /**
     * Export profile as JSON
     */
    function exportProfile() {
        const profile = loadProfile();
        
        // Track backup date
        profile.lastBackupDate = new Date().toISOString();
        saveProfile(profile);
        
        const dataStr = JSON.stringify(profile, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `copper-candle-profile-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * Import profile from JSON
     */
    function importProfile(jsonString) {
        try {
            const profile = JSON.parse(jsonString);
            saveProfile(profile);
            return true;
        } catch (error) {
            console.error('Error importing profile:', error);
            return false;
        }
    }
    
    /**
     * Check if backup reminder should be shown
     */
    function shouldShowBackupReminder() {
        const profile = loadProfile();
        
        // Don't show if profile is empty
        if (!isProfileComplete()) {
            return false;
        }
        
        // Check if reminder was dismissed recently
        const dismissedUntil = localStorage.getItem('backupReminderDismissedUntil');
        if (dismissedUntil && new Date(dismissedUntil) > new Date()) {
            return false;
        }
        
        // Check last backup date
        if (!profile.lastBackupDate) {
            // No backup yet - show reminder if profile is older than 30 days
            const profileCreated = profile.createdAt || new Date().toISOString();
            const daysSinceCreation = (new Date() - new Date(profileCreated)) / (1000 * 60 * 60 * 24);
            return daysSinceCreation > 30;
        }
        
        // Check if last backup was more than 30 days ago
        const daysSinceBackup = (new Date() - new Date(profile.lastBackupDate)) / (1000 * 60 * 60 * 24);
        return daysSinceBackup > 30;
    }
    
    /**
     * Dismiss backup reminder for specified days
     */
    function dismissBackupReminder(days = 7) {
        const dismissUntil = new Date();
        dismissUntil.setDate(dismissUntil.getDate() + days);
        localStorage.setItem('backupReminderDismissedUntil', dismissUntil.toISOString());
    }
    
    /**
     * Get days since last backup
     */
    function getDaysSinceLastBackup() {
        const profile = loadProfile();
        if (!profile.lastBackupDate) {
            return null;
        }
        return Math.floor((new Date() - new Date(profile.lastBackupDate)) / (1000 * 60 * 60 * 24));
    }
    
    /**
     * Get risk profile description
     */
    function getRiskProfileDescription(riskProfile) {
        const descriptions = {
            conservative: {
                title: 'Conservative',
                description: 'Prioritizes capital preservation. 1-2% risk per trade, 6-8% max portfolio heat.',
                color: '#00ff88',
                icon: 'fa-shield-alt'
            },
            moderate: {
                title: 'Moderate',
                description: 'Balanced approach. 2-3% risk per trade, 8-12% max portfolio heat.',
                color: '#00b0ff',
                icon: 'fa-balance-scale'
            },
            aggressive: {
                title: 'Aggressive',
                description: 'Growth focused with higher risk. 3-5% risk per trade, 12-15% max portfolio heat.',
                color: '#d68b45',
                icon: 'fa-rocket'
            }
        };
        
        return descriptions[riskProfile] || descriptions.conservative;
    }
    
    /**
     * Get trading style description
     */
    function getTradingStyleDescription(style) {
        const descriptions = {
            scalper: {
                title: 'Scalper',
                description: 'High-frequency, quick profits. 10-50+ trades per day.',
                timeframes: ['1m', '5m'],
                icon: 'fa-bolt'
            },
            day: {
                title: 'Day Trader',
                description: 'Intraday positions. 1-10 trades per day.',
                timeframes: ['5m', '15m', '1h'],
                icon: 'fa-sun'
            },
            swing: {
                title: 'Swing Trader',
                description: 'Multi-day positions. 2-5 trades per week.',
                timeframes: ['1h', '4h', '1d'],
                icon: 'fa-wave-square'
            },
            position: {
                title: 'Position Trader',
                description: 'Long-term positions. 1-2 trades per month.',
                timeframes: ['1d', '1w'],
                icon: 'fa-chart-line'
            }
        };
        
        return descriptions[style] || null;
    }
    
    /**
     * Show calculator-specific recommendations
     * Filters and displays only CRITICAL and HIGH priority recommendations
     * relevant to the current calculator
     */
    function showCalculatorRecommendations(calculatorName) {
        const recommendations = getRecommendations();
        
        // Filter for critical and high priority only
        const importantRecs = recommendations.filter(rec => 
            rec.priority === 'critical' || rec.priority === 'high'
        );
        
        if (importantRecs.length === 0) {
            return; // No important recommendations to show
        }
        
        // Check if user has dismissed recommendations
        const dismissedKey = 'calc_rec_dismissed_' + calculatorName;
        const dismissed = localStorage.getItem(dismissedKey);
        const dismissedTime = dismissed ? parseInt(dismissed) : 0;
        const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
        
        // Re-show after 24 hours
        if (hoursSinceDismissed < 24) {
            return;
        }
        
        // Create recommendation banner
        const container = document.getElementById('calcRecommendations') || createRecommendationContainer();
        
        let html = '';
        importantRecs.forEach(rec => {
            const alertType = rec.priority === 'critical' ? 'danger' : 'warning';
            const icon = rec.icon || 'fa-info-circle';
            
            html += `
                <div class="alert alert-${alertType} alert-dismissible fade show mb-3" role="alert">
                    <i class="fas ${icon} me-2"></i>
                    <strong>${rec.title}:</strong> ${rec.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" 
                        onclick="PersonalizationEngine.dismissRecommendation('${calculatorName}')"></button>
                </div>
            `;
        });
        
        container.innerHTML = html;
        container.style.display = 'block';
    }
    
    function createRecommendationContainer() {
        const container = document.createElement('div');
        container.id = 'calcRecommendations';
        container.style.display = 'none';
        const mainContainer = document.querySelector('.container');
        const firstCard = mainContainer.querySelector('.row');
        mainContainer.insertBefore(container, firstCard);
        return container;
    }
    
    function dismissRecommendation(calculatorName) {
        const dismissedKey = 'calc_rec_dismissed_' + calculatorName;
        localStorage.setItem(dismissedKey, Date.now().toString());
    }
    
    // ==========================================
    // ANONYMOUS USAGE ANALYTICS (100% Local)
    // ==========================================
    
    const ANALYTICS_KEY = 'copperCandle_analytics';
    
    /**
     * Track calculator view
     */
    function trackCalculatorView(calculatorName) {
        const analytics = getAnalytics();
        
        if (!analytics.calculatorViews[calculatorName]) {
            analytics.calculatorViews[calculatorName] = {
                count: 0,
                firstView: new Date().toISOString(),
                lastView: null
            };
        }
        
        analytics.calculatorViews[calculatorName].count++;
        analytics.calculatorViews[calculatorName].lastView = new Date().toISOString();
        analytics.totalPageViews++;
        
        saveAnalytics(analytics);
    }
    
    /**
     * Track time spent on calculator
     */
    function trackTimeSpent(calculatorName, seconds) {
        const analytics = getAnalytics();
        
        if (!analytics.timeSpent[calculatorName]) {
            analytics.timeSpent[calculatorName] = 0;
        }
        
        analytics.timeSpent[calculatorName] += seconds;
        analytics.totalTimeSpent += seconds;
        
        saveAnalytics(analytics);
    }
    
    /**
     * Track calculation performed
     */
    function trackCalculation(calculatorName) {
        const analytics = getAnalytics();
        
        if (!analytics.calculations[calculatorName]) {
            analytics.calculations[calculatorName] = 0;
        }
        
        analytics.calculations[calculatorName]++;
        analytics.totalCalculations++;
        
        saveAnalytics(analytics);
    }
    
    /**
     * Track error occurrence
     */
    function trackError(calculatorName, errorType) {
        const analytics = getAnalytics();
        
        if (!analytics.errors[calculatorName]) {
            analytics.errors[calculatorName] = {};
        }
        
        if (!analytics.errors[calculatorName][errorType]) {
            analytics.errors[calculatorName][errorType] = 0;
        }
        
        analytics.errors[calculatorName][errorType]++;
        analytics.totalErrors++;
        
        saveAnalytics(analytics);
    }
    
    /**
     * Get analytics data
     */
    function getAnalytics() {
        try {
            const stored = localStorage.getItem(ANALYTICS_KEY);
            if (!stored) {
                return createDefaultAnalytics();
            }
            return JSON.parse(stored);
        } catch (error) {
            console.error('Error loading analytics:', error);
            return createDefaultAnalytics();
        }
    }
    
    /**
     * Save analytics data
     */
    function saveAnalytics(analytics) {
        try {
            analytics.lastUpdated = new Date().toISOString();
            localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
        } catch (error) {
            console.error('Error saving analytics:', error);
        }
    }
    
    /**
     * Create default analytics structure
     */
    function createDefaultAnalytics() {
        return {
            version: '1.0',
            createdAt: new Date().toISOString(),
            lastUpdated: null,
            totalPageViews: 0,
            totalCalculations: 0,
            totalTimeSpent: 0,
            totalErrors: 0,
            calculatorViews: {},
            calculations: {},
            timeSpent: {},
            errors: {}
        };
    }
    
    /**
     * Get analytics summary
     */
    function getAnalyticsSummary() {
        const analytics = getAnalytics();
        
        // Calculate most popular calculators by views
        const popularByViews = Object.entries(analytics.calculatorViews)
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 10)
            .map(([name, data]) => ({ name, views: data.count, lastView: data.lastView }));
        
        // Calculate most used calculators by calculations
        const popularByCalcs = Object.entries(analytics.calculations)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([name, count]) => ({ name, calculations: count }));
        
        // Calculate average time spent
        const timeSpentData = Object.entries(analytics.timeSpent)
            .map(([name, seconds]) => ({
                name,
                totalSeconds: seconds,
                averageSeconds: Math.round(seconds / (analytics.calculatorViews[name]?.count || 1))
            }))
            .sort((a, b) => b.totalSeconds - a.totalSeconds)
            .slice(0, 10);
        
        // Calculate error rates
        const errorData = Object.entries(analytics.errors)
            .map(([name, errors]) => ({
                name,
                totalErrors: Object.values(errors).reduce((sum, count) => sum + count, 0),
                errorTypes: errors
            }))
            .sort((a, b) => b.totalErrors - a.totalErrors);
        
        return {
            overview: {
                totalPageViews: analytics.totalPageViews,
                totalCalculations: analytics.totalCalculations,
                totalTimeSpent: analytics.totalTimeSpent,
                totalErrors: analytics.totalErrors,
                averageTimePerVisit: analytics.totalPageViews > 0 
                    ? Math.round(analytics.totalTimeSpent / analytics.totalPageViews) 
                    : 0
            },
            popularByViews,
            popularByCalcs,
            timeSpentData,
            errorData,
            createdAt: analytics.createdAt,
            lastUpdated: analytics.lastUpdated
        };
    }
    
    /**
     * Export analytics as JSON
     */
    function exportAnalytics() {
        const analytics = getAnalytics();
        const summary = getAnalyticsSummary();
        
        const exportData = {
            analytics,
            summary,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `copper-candle-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * Reset analytics data
     */
    function resetAnalytics() {
        if (confirm('Are you sure you want to reset all analytics data? This cannot be undone.')) {
            localStorage.removeItem(ANALYTICS_KEY);
            return true;
        }
        return false;
    }
    
    // Public API
    return {
        loadProfile,
        saveProfile,
        updateProfile,
        isProfileComplete,
        getProfileCompleteness,
        getRecommendations,
        getCalculatorDefaults,
        trackCalculatorUsage,
        getMostUsedCalculators,
        resetProfile,
        exportProfile,
        importProfile,
        shouldShowBackupReminder,
        dismissBackupReminder,
        getDaysSinceLastBackup,
        getRiskProfileDescription,
        getTradingStyleDescription,
        showCalculatorRecommendations,
        dismissRecommendation,
        // Analytics functions
        trackCalculatorView,
        trackTimeSpent,
        trackCalculation,
        trackError,
        getAnalytics,
        getAnalyticsSummary,
        exportAnalytics,
        resetAnalytics,
        DEFAULT_PROFILE
    };
})();

// Make available globally
window.PersonalizationEngine = PersonalizationEngine;
