// Global state
let currentData = null;
let projectionChart = null;
let monteCarloChart = null;
let customPresets = {};

// DOM Elements
const form = document.getElementById('calculatorForm');
const resultsContainer = document.getElementById('resultsContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const resetBtn = document.getElementById('resetBtn');
const savePresetBtn = document.getElementById('savePresetBtn');
const savePresetModal = new bootstrap.Modal(document.getElementById('savePresetModal'));
const confirmSavePresetBtn = document.getElementById('confirmSavePresetBtn');

// Presets
const presets = {
    conservative: {
        accountSize: 5000,
        riskPercent: 5,
        winRate: 85,
        avgWin: 40,
        avgLoss: 25,
        stopLoss: 50,
        contractPrice: 1.00,
        commission: 0.65,
        tradesPerDay: 1,
        days: 30
    },
    moderate: {
        accountSize: 3125,
        riskPercent: 8,
        winRate: 80,
        avgWin: 50,
        avgLoss: 30,
        stopLoss: 50,
        contractPrice: 1.00,
        commission: 0.65,
        tradesPerDay: 2,
        days: 30
    },
    aggressive: {
        accountSize: 3125,
        riskPercent: 12,
        winRate: 75,
        avgWin: 60,
        avgLoss: 35,
        stopLoss: 70,
        contractPrice: 1.00,
        commission: 0.65,
        tradesPerDay: 3,
        days: 30
    }
};

// Initialize function - extracted from DOMContentLoaded for testing
function initialize() {
    // Set up event listeners
    form.addEventListener('submit', handleSubmit);
    resetBtn.addEventListener('click', resetForm);
    savePresetBtn.addEventListener('click', () => savePresetModal.show());
    confirmSavePresetBtn.addEventListener('click', saveCustomPreset);
    
    // Load custom presets from localStorage
    loadCustomPresets();
    
    // Preset buttons
    document.querySelectorAll('.btn-preset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const preset = e.currentTarget.dataset.preset;
            loadPreset(preset);
        });
    });
    
    // Add real-time input listeners
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(() => {
            // Validate risk percent
            if (input.id === 'riskPercent') {
                const riskValue = parseFloat(input.value);
                const riskWarning = document.getElementById('riskWarning');
                if (riskValue > 95) {
                    input.value = 95;
                    /* istanbul ignore next */
                    if (riskWarning) {
                        riskWarning.style.display = 'block';
                        /* istanbul ignore next */
                        setTimeout(() => {
                            riskWarning.style.display = 'none';
                        }, 3000);
                    }
                }
            }
            runCalculation();
        }, 300));
        
        // Add keyboard shortcuts
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                input.value = parseFloat(input.value || 0) + parseFloat(input.step || 1);
                input.dispatchEvent(new Event('input'));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                input.value = Math.max(parseFloat(input.min || 0), parseFloat(input.value || 0) - parseFloat(input.step || 1));
                input.dispatchEvent(new Event('input'));
            }
        });
    });
    
    // Load saved values from localStorage
    loadSavedValues();
    
    // Check for URL parameters
    loadFromURL();
    
    // Initialize Bootstrap tooltips
    initializeTooltips();
    
    // Run initial calculation
    runCalculation();
}

// Initialize help display system for all elements with data-tooltip
function initializeTooltips() {
    const helpModal = document.getElementById('helpModal');
    const helpModalTitle = document.getElementById('helpModalTitle');
    const helpModalDescription = document.getElementById('helpModalDescription');
    const helpIcons = document.querySelectorAll('.help-icon');
    
    if (!helpModal || !helpModalTitle || !helpModalDescription) {
        return;
    }
    
    helpIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Get help content from parent element's data attributes
            const parent = this.closest('[data-help-title]');
            if (parent) {
                const title = parent.getAttribute('data-help-title') || 'Information';
                const text = parent.getAttribute('data-help-text') || '';
                const example = parent.getAttribute('data-help-example') || '';
                const good = parent.getAttribute('data-help-good') || '';
                const why = parent.getAttribute('data-help-why') || '';
                
                // Build structured HTML content
                let htmlContent = '';
                
                if (text) {
                    htmlContent += `<div class="help-section"><div class="help-section-label">What is this?</div><div class="help-section-text">${text}</div></div>`;
                }
                
                if (example) {
                    htmlContent += `<div class="help-section"><div class="help-section-label">Example</div><div class="help-section-text help-example">${example}</div></div>`;
                }
                
                if (good) {
                    htmlContent += `<div class="help-section"><div class="help-section-label">Target Values</div><div class="help-section-text help-targets">${good}</div></div>`;
                }
                
                if (why) {
                    htmlContent += `<div class="help-section"><div class="help-section-label">Why it matters</div><div class="help-section-text">${why}</div></div>`;
                }
                
                helpModalTitle.textContent = title;
                helpModalDescription.innerHTML = htmlContent;
                
                // Show the modal
                const modal = new bootstrap.Modal(helpModal);
                modal.show();
            }
        });
    });
}

// Initialize
/* istanbul ignore next */
document.addEventListener('DOMContentLoaded', () => {
    initialize();
});

// Debounce function to prevent too many API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Chart tooltip formatters (extracted for testing)
function formatProjectionTooltipTitle(context) {
    return `Day ${context[0].label}`;
}

function formatProjectionTooltipLabel(context) {
    return `$${context.parsed.y.toLocaleString()}`;
}

function formatYAxisTick(value) {
    return '$' + (value/1000).toFixed(1) + 'k';
}

function formatMonteCarloTooltipLabel(context) {
    return `${context.parsed.y} outcomes`;
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    // Form submission still works but calculation happens on input change
    await runCalculation();
}

// Run the calculation
async function runCalculation() {
    const calculateBtn = document.getElementById('calculateBtn');
    
    // Show loading indicator and disable button
    if (resultsContainer.classList.contains('d-none')) {
        loadingIndicator.classList.remove('d-none');
    }
    
    // Add calculating state to button
    if (calculateBtn) {
        calculateBtn.disabled = true;
        calculateBtn.classList.add('calculating');
        const originalText = calculateBtn.innerHTML;
        calculateBtn.setAttribute('data-original-text', originalText);
    }
    
    // Get form values
    const params = getFormValues();
    
    // Save to localStorage
    saveValues(params);
    
    try {
        // Run calculations locally (no server needed!)
        const result = runSimulation(params);
        
        if (result.success) {
            currentData = result.data;
            displayResults(result.data);
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Calculation error:', error);
        alert('Failed to calculate: ' + error.message);
    } finally {
        loadingIndicator.classList.add('d-none');
        resultsContainer.classList.remove('d-none');
        
        // Restore button state
        if (calculateBtn) {
            calculateBtn.disabled = false;
            calculateBtn.classList.remove('calculating');
            const originalText = calculateBtn.getAttribute('data-original-text');
            if (originalText) {
                calculateBtn.innerHTML = originalText;
            }
        }
    }
}

// Get form values
function getFormValues() {
    const accountSize = parseFloat(document.getElementById('accountSize').value);
    const riskPercent = parseFloat(document.getElementById('riskPercent').value) / 100;
    const contractPrice = parseFloat(document.getElementById('contractPrice').value);
    const commission = parseFloat(document.getElementById('commission').value);
    const stopLoss = parseFloat(document.getElementById('stopLoss').value) / 100;
    const contractStep = parseFloat(document.getElementById('contractStep').value) || 1;
    
    // Calculate actual contract size based on risk and contract step
    const riskAmount = accountSize * riskPercent;
    const maxLossPerContract = contractPrice * 100 * stopLoss;
    const roundTripCommission = commission * 2;
    const totalLossPerContract = maxLossPerContract + roundTripCommission;
    
    // Ideal contract size to match risk
    const idealContracts = Math.floor(riskAmount / totalLossPerContract);
    
    // Round to nearest contract step
    const roundedContracts = Math.max(contractStep, Math.round(idealContracts / contractStep) * contractStep);
    
    // Calculate potential costs for the rounded contracts
    const potentialStopLossCost = (roundedContracts * maxLossPerContract) + (roundedContracts * roundTripCommission);
    
    // Ensure stop loss cost doesn't exceed account size limits
    let actualContracts = roundedContracts;
    if (potentialStopLossCost > accountSize * 0.95) {
        const maxSafeRisk = accountSize * 0.95;
        const maxSafeContracts = Math.floor(maxSafeRisk / (maxLossPerContract + roundTripCommission));
        actualContracts = Math.max(1, Math.floor(maxSafeContracts / contractStep) * contractStep);
    }
    
    // Calculate the ACTUAL risk percentage based on final contract count
    const actualStopLossCost = (actualContracts * maxLossPerContract) + (actualContracts * roundTripCommission);
    const actualRiskPercent = actualStopLossCost / accountSize;
    
    return {
        accountSize,
        riskPercent: Math.round(actualRiskPercent * 10000) / 10000, // Round to 4 decimal places
        winRate: parseFloat(document.getElementById('winRate').value) / 100,
        avgWin: parseFloat(document.getElementById('avgWin').value) / 100,
        avgLoss: parseFloat(document.getElementById('avgLoss').value) / 100,
        stopLoss,
        contractPrice,
        commission,
        tradesPerDay: parseInt(document.getElementById('tradesPerDay').value),
        days: parseInt(document.getElementById('days').value),
        simulations: 10000
    };
}

// Display results
function displayResults(data) {
    const { metrics, projection, monteCarlo, streakProbabilities, drawdownScenarios } = data;
    
    // Calculate contract details
    const contractPrice = parseFloat(document.getElementById('contractPrice').value);
    const commission = parseFloat(document.getElementById('commission').value);
    const riskAmount = metrics.riskPerTrade;
    const stopLossPercent = metrics.stopLoss;
    const contractStep = parseFloat(document.getElementById('contractStep').value) || 1;
    
    // Calculate how many contracts based on risk and stop loss
    const maxLossPerContract = contractPrice * 100 * stopLossPercent;
    const roundTripCommission = commission * 2; // Entry + Exit
    const totalLossPerContract = maxLossPerContract + roundTripCommission;
    
    // Ideal contract size to match risk
    const idealContracts = Math.floor(riskAmount / totalLossPerContract);
    
    // Round to nearest contract step (e.g., nearest 1, 3, 5, 10)
    const roundedContracts = Math.max(contractStep, Math.round(idealContracts / contractStep) * contractStep);
    
    // Calculate potential costs for the rounded contracts
    const potentialStopLossCost = (roundedContracts * maxLossPerContract) + (roundedContracts * roundTripCommission);
    
    // Ensure stop loss cost doesn't exceed risk amount (validate against account)
    let actualContracts = roundedContracts;
    if (potentialStopLossCost > metrics.accountSize * 0.95) {
        // Recalculate to fit within safe limits
        const maxSafeRisk = metrics.accountSize * 0.95;
        const maxSafeContracts = Math.floor(maxSafeRisk / (maxLossPerContract + roundTripCommission));
        actualContracts = Math.max(1, Math.floor(maxSafeContracts / contractStep) * contractStep);
    }
    
    // Calculate actual costs with validated contract size
    const entryCost = (actualContracts * contractPrice * 100) + (actualContracts * commission);
    const stopLossCost = (actualContracts * maxLossPerContract) + (actualContracts * roundTripCommission);
    
    // Win target should be based on Avg Win %, not expected value
    const avgWinPercent = parseFloat(document.getElementById('avgWin').value) / 100;
    const winTargetProfit = (actualContracts * contractPrice * 100 * avgWinPercent) - (actualContracts * roundTripCommission);
    
    const tradesPerDay = parseFloat(document.getElementById('tradesPerDay').value);
    const dailyFees = roundTripCommission * actualContracts * tradesPerDay;
    
    // Calculate break-even win rate with fees
    const feesPerTrade = actualContracts * roundTripCommission;
    const avgWinAmount = actualContracts * contractPrice * 100 * (parseFloat(document.getElementById('avgWin').value) / 100);
    const avgLossAmount = actualContracts * contractPrice * 100 * (parseFloat(document.getElementById('avgLoss').value) / 100);
    const breakEvenWR = ((avgLossAmount + feesPerTrade) / (avgWinAmount + avgLossAmount)) * 100;
    
    // Update trade summary
    document.getElementById('contractSize').textContent = `${actualContracts}-lot`;
    document.getElementById('contractDesc').textContent = `${actualContracts} contract${actualContracts > 1 ? 's' : ''} @ $${contractPrice.toFixed(2)}`;
    document.getElementById('entryCost').textContent = `$${entryCost.toFixed(2)}`;
    document.getElementById('stopLossCost').textContent = `-$${stopLossCost.toFixed(2)}`;
    document.getElementById('winTarget').textContent = `+$${Math.max(0, winTargetProfit).toFixed(2)}`;
    document.getElementById('dailyFees').textContent = `$${dailyFees.toFixed(2)}`;
    document.getElementById('feesDesc').textContent = `${(dailyFees / metrics.accountSize * 100).toFixed(2)}% of account`;
    document.getElementById('breakEvenWinRate').textContent = `${breakEvenWR.toFixed(1)}%`;
    
    // Color code break-even
    const beElement = document.getElementById('breakEvenWinRate');
    const currentWR = parseFloat(document.getElementById('winRate').value);
    if (currentWR > breakEvenWR + 10) {
        beElement.classList.add('text-success');
        beElement.classList.remove('text-warning', 'text-danger');
    } else if (currentWR > breakEvenWR) {
        beElement.classList.add('text-warning');
        beElement.classList.remove('text-success', 'text-danger');
    } else {
        beElement.classList.add('text-danger');
        beElement.classList.remove('text-success', 'text-warning');
    }
    
    // Add update animation
    document.querySelectorAll('.metric-value').forEach(el => {
        el.classList.add('updating');
        setTimeout(() => el.classList.remove('updating'), 300);
    });
    
    // Update metric cards with color coding
    updateMetricWithColor('evValue', `${metrics.expectedValue}%`, metrics.expectedValue, 30, 40);
    
    // Add Win Rate metric
    const winRatePercent = parseFloat(document.getElementById('winRate').value);
    updateMetricWithColor('winRateMetric', `${winRatePercent}%`, winRatePercent, 50, 70);
    
    updateMetricWithColor('riskValue', `$${metrics.riskPerTrade.toLocaleString()}`, metrics.riskPerTrade, 200, 400, true);
    updateMetricWithColor('dailyGrowthValue', `${metrics.dailyGrowthRate}%`, metrics.dailyGrowthRate, 3, 6);
    document.getElementById('profitPerTradeValue').textContent = `$${metrics.expectedProfitPerTrade.toLocaleString()}`;
    document.getElementById('dailyProfitValue').textContent = `$${metrics.expectedDailyProfit.toLocaleString()}`;
    updateMetricWithColor('profitFactorValue', metrics.profitFactor, metrics.profitFactor, 2, 3);
    
    // Update advanced metrics
    updateMetricWithColor('kellyValue', `${metrics.kellyFraction}%`, metrics.kellyFraction, 10, 20);
    document.getElementById('payoffValue').textContent = metrics.payoffRatio;
    
    // Display expected maximum loss streak
    if (data.expectedMaxLossStreak !== undefined) {
        document.getElementById('maxWinStreakValue').textContent = data.expectedMaxLossStreak;
    } else {
        document.getElementById('maxWinStreakValue').textContent = '--';
    }
    
    updateMetricWithColor('ruinValue', `${monteCarlo.statistics.ruinProbability}%`, monteCarlo.statistics.ruinProbability, 5, 1, true);
    
    // Update Monte Carlo statistics with animation
    const mcStats = [
        { id: 'mcMean', value: `$${monteCarlo.statistics.mean.toLocaleString()}` },
        { id: 'mcMedian', value: `$${monteCarlo.statistics.median.toLocaleString()}` },
        { id: 'mc5th', value: `$${monteCarlo.statistics.percentile5.toLocaleString()}` },
        { id: 'mc95th', value: `$${monteCarlo.statistics.percentile95.toLocaleString()}` }
    ];
    
    mcStats.forEach((stat, index) => {
        const el = document.getElementById(stat.id);
        setTimeout(() => {
            el.style.transition = 'all 0.2s ease';
            el.style.transform = 'scale(1.1)';
            el.textContent = stat.value;
            setTimeout(() => {
                el.style.transform = 'scale(1)';
            }, 200);
        }, index * 50);
    });
    
    // Create charts
    createProjectionChart(projection);
    createMonteCarloChart(monteCarlo.histogram);
    
    // Populate tables
    populateStreakTable(streakProbabilities);
    populateDrawdownTable(drawdownScenarios);
    
    // Populate new feature tables
    if (data.winStreakProbabilities) {
        populateWinStreakTable(data.winStreakProbabilities);
    }
    if (data.riskOfRuin) {
        populateRiskOfRuinTable(data.riskOfRuin);
    }
    if (data.targetProjections) {
        populateTargetTable(data.targetProjections);
    }
    if (data.timeBasedAnalysis) {
        populateTimeBasedTable(data.timeBasedAnalysis);
    }
    if (data.recoveryCalculations) {
        populateRecoveryTable(data.recoveryCalculations);
    }
    if (metrics.sharpeRatio !== undefined) {
        updateMetricWithColor('sharpeValue', metrics.sharpeRatio.toFixed(2), metrics.sharpeRatio, 1, 2);
    }
    
    // Generate position sizing guide
    generatePositionSizing(data);
}

// Update metric with color coding
function updateMetricWithColor(elementId, value, numValue, goodThreshold, greatThreshold, inverse = false) {
    const element = document.getElementById(elementId);
    element.textContent = value;
    
    // Remove previous color classes
    element.classList.remove('text-danger', 'text-warning', 'text-success');
    
    // Apply color based on thresholds
    if (inverse) {
        if (numValue >= goodThreshold) {
            element.classList.add('text-danger');
        } else if (numValue >= greatThreshold) {
            element.classList.add('text-warning');
        } else {
            element.classList.add('text-success');
        }
    } else {
        if (numValue >= greatThreshold) {
            element.classList.add('text-success');
        } else if (numValue >= goodThreshold) {
            element.classList.add('text-warning');
        } else {
            element.classList.add('text-danger');
        }
    }
}

// Create projection chart
function createProjectionChart(projection) {
    const ctx = document.getElementById('projectionChart');
    
    if (projectionChart) {
        // Update existing chart with animation
        projectionChart.data.labels = projection.map(p => p.day);
        projectionChart.data.datasets[0].data = projection.map(p => p.balance);
        projectionChart.update('active');
        return;
    }
    
    projectionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: projection.map(p => p.day),
            datasets: [{
                label: 'Balance',
                data: projection.map(p => p.balance),
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#00d4ff',
                pointBorderColor: '#0a1628',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#00d4ff',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            },
            interaction: {
                mode: 'nearest',
                intersect: false,
                axis: 'x'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#00d4ff',
                    bodyColor: '#ffffff',
                    borderColor: '#00d4ff',
                    borderWidth: 1,
                    padding: 8,
                    displayColors: false,
                    callbacks: {
                        title: formatProjectionTooltipTitle,
                        label: formatProjectionTooltipLabel
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(30, 40, 64, 0.5)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#8b92b0',
                        maxTicksLimit: 8,
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(30, 40, 64, 0.5)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#8b92b0',
                        font: {
                            size: 10
                        },
                        callback: formatYAxisTick
                    }
                }
            }
        }
    });
}

// Create Monte Carlo chart
function createMonteCarloChart(histogram) {
    const ctx = document.getElementById('monteCarloChart');
    
    if (monteCarloChart) {
        // Update existing chart with animation
        monteCarloChart.data.labels = histogram.labels.map(l => (l/1000).toFixed(1) + 'k');
        monteCarloChart.data.datasets[0].data = histogram.data;
        monteCarloChart.update('active');
        return;
    }
    
    monteCarloChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: histogram.labels.map(l => (l/1000).toFixed(1) + 'k'),
            datasets: [{
                label: 'Frequency',
                data: histogram.data,
                backgroundColor: 'rgba(0, 212, 255, 0.5)',
                borderColor: '#00d4ff',
                borderWidth: 1,
                barPercentage: 1.0,
                categoryPercentage: 1.0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#00d4ff',
                    bodyColor: '#ffffff',
                    borderColor: '#00d4ff',
                    borderWidth: 1,
                    padding: 8,
                    displayColors: false,
                    callbacks: {
                        label: formatMonteCarloTooltipLabel
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(30, 40, 64, 0.5)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#8b92b0',
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: true,
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(30, 40, 64, 0.5)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#8b92b0',
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// Populate streak probability table
function populateStreakTable(streaks) {
    const tbody = document.querySelector('#streakTable tbody');
    
    // Fade out animation
    tbody.style.opacity = '0.3';
    
    setTimeout(() => {
        tbody.innerHTML = '';
        
        // Show first 9 streaks
        streaks.slice(0, 9).forEach((streak, index) => {
            const row = tbody.insertRow();
            row.style.opacity = '0';
            row.style.transform = 'translateX(-10px)';
            
            row.innerHTML = `
                <td>${streak.streak}L</td>
                <td><small>${streak.probability}%</small></td>
                <td><small>${streak.frequency}</small></td>
            `;
            
            // Highlight critical streaks
            if (streak.streak >= 9) {
                row.style.backgroundColor = 'rgba(255, 51, 102, 0.1)';
                row.style.borderLeft = '2px solid var(--danger-color)';
            }
            
            // Staggered fade in
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 30);
        });
        
        tbody.style.opacity = '1';
    }, 150);
}

// Populate drawdown table
function populateDrawdownTable(scenarios) {
    const tbody = document.querySelector('#drawdownTable tbody');
    
    // Fade out animation
    tbody.style.opacity = '0.3';
    
    setTimeout(() => {
        tbody.innerHTML = '';
        
    // Show first 9 scenarios
    scenarios.slice(0, 9).forEach((scenario, index) => {
        const row = tbody.insertRow();
        row.style.opacity = '0';
        row.style.transform = 'translateX(-10px)';
        
        const balance = scenario.remainingBalance || scenario.balance || 0;
        row.innerHTML = `
            <td>${scenario.consecutiveLosses}</td>
            <td><small>$${balance.toLocaleString()}</small></td>
        `;            if (!scenario.survivable) {
                row.style.backgroundColor = 'rgba(255, 51, 102, 0.1)';
                row.style.borderLeft = '2px solid var(--danger-color)';
            }
            
            // Staggered fade in
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 30);
        });
        
        tbody.style.opacity = '1';
    }, 150);
}

// Populate win streak table
function populateWinStreakTable(streaks) {
    const tbody = document.querySelector('#winStreakTable tbody');
    tbody.style.opacity = '0.3';
    
    setTimeout(() => {
        tbody.innerHTML = '';
        streaks.slice(0, 8).forEach((streak, index) => {
            const row = tbody.insertRow();
            row.style.opacity = '0';
            row.style.transform = 'translateX(-10px)';
            
            row.innerHTML = `
                <td>${streak.streak}</td>
                <td>${streak.probability}%</td>
                <td><small>${streak.frequency}</small></td>
            `;
            
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 30);
        });
        tbody.style.opacity = '1';
    }, 150);
}

// Populate risk of ruin table
function populateRiskOfRuinTable(risks) {
    const tbody = document.querySelector('#riskOfRuinTable tbody');
    tbody.style.opacity = '0.3';
    
    setTimeout(() => {
        tbody.innerHTML = '';
        risks.forEach((risk, index) => {
            const row = tbody.insertRow();
            row.style.opacity = '0';
            row.style.transform = 'translateX(-10px)';
            
            row.innerHTML = `
                <td>${risk.drawdownLevel}%</td>
                <td>${risk.probability}%</td>
                <td>${risk.lossesRequired}</td>
            `;
            
            if (risk.probability > 10) {
                row.style.backgroundColor = 'rgba(255, 51, 102, 0.1)';
                row.style.borderLeft = '2px solid var(--danger-color)';
            }
            
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 30);
        });
        tbody.style.opacity = '1';
    }, 150);
}

// Populate target table
function populateTargetTable(targets) {
    const tbody = document.querySelector('#targetTable tbody');
    tbody.style.opacity = '0.3';
    
    setTimeout(() => {
        tbody.innerHTML = '';
        targets.forEach((target, index) => {
            const row = tbody.insertRow();
            row.style.opacity = '0';
            row.style.transform = 'translateX(-10px)';
            
            row.innerHTML = `
                <td>${target.targetMultiple}x</td>
                <td><small>$${target.targetAmount.toLocaleString()}</small></td>
                <td>${target.daysNeeded}</td>
            `;
            
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 30);
        });
        tbody.style.opacity = '1';
    }, 150);
}

// Populate time-based table
function populateTimeBasedTable(analysis) {
    const tbody = document.querySelector('#timeBasedTable tbody');
    tbody.style.opacity = '0.3';
    
    setTimeout(() => {
        tbody.innerHTML = '';
        const periods = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
        const labels = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
        
        periods.forEach((period, index) => {
            const data = analysis[period];
            const row = tbody.insertRow();
            row.style.opacity = '0';
            row.style.transform = 'translateX(-10px)';
            
            const growthColor = data.growth >= 0 ? 'success' : 'danger';
            row.innerHTML = `
                <td>${labels[index]}</td>
                <td>${data.trades}</td>
                <td><small>$${data.balance.toLocaleString()}</small></td>
                <td class="text-${growthColor}">${data.growth.toFixed(1)}%</td>
            `;
            
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 30);
        });
        tbody.style.opacity = '1';
    }, 150);
}

// Populate recovery table
function populateRecoveryTable(recoveries) {
    const tbody = document.querySelector('#recoveryTable tbody');
    tbody.style.opacity = '0.3';
    
    setTimeout(() => {
        tbody.innerHTML = '';
        recoveries.forEach((recovery, index) => {
            const row = tbody.insertRow();
            row.style.opacity = '0';
            row.style.transform = 'translateX(-10px)';
            
            row.innerHTML = `
                <td>${recovery.drawdownPercent}%</td>
                <td>${recovery.recoveryNeeded}%</td>
                <td>${recovery.winsRequired}</td>
            `;
            
            if (recovery.winsRequired > 20) {
                row.style.backgroundColor = 'rgba(255, 51, 102, 0.1)';
            }
            
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 30);
        });
        tbody.style.opacity = '1';
    }, 150);
}

// Generate position sizing table
function generatePositionSizing(data) {
    const container = document.getElementById('positionSizing');
    
    if (!data || !data.metrics) {
        container.innerHTML = '<p class="text-muted text-center">Run calculation to see position sizing</p>';
        return;
    }
    
    // Fade out for transition
    container.style.opacity = '0.3';
    
    setTimeout(() => {
        const currentRiskPercent = (data.metrics.riskPerTrade / data.metrics.accountSize) * 100;
        
        // Dynamic risk levels based on current settings
        const riskLevels = [
            { label: 'Ultra Safe', percent: Math.max(0.5, currentRiskPercent * 0.25), desc: 'Cap. preservation' },
            { label: 'Conservative', percent: Math.max(1, currentRiskPercent * 0.5), desc: 'Very low risk' },
            { label: 'Moderate', percent: Math.max(2, currentRiskPercent * 0.75), desc: 'Balanced approach' },
            { label: 'Current', percent: currentRiskPercent, desc: 'Your setting', highlight: true },
            { label: 'Aggressive', percent: Math.min(15, currentRiskPercent * 1.5), desc: 'Higher risk' },
            { label: 'Maximum', percent: Math.min(20, currentRiskPercent * 2), desc: 'Very high risk' }
        ];
        
        // Calculate Kelly Criterion percentage
        const kellyPercent = data.metrics.kellyFraction;
        
        let html = '<div class="position-sizing-header mb-2">';
        html += '<div class="d-flex justify-content-between align-items-center">';
        html += '<small class="text-muted">Account: <strong class="text-primary">$' + data.metrics.accountSize.toLocaleString() + '</strong></small>';
        html += '<small class="text-muted">Kelly: <strong class="text-warning">' + kellyPercent.toFixed(1) + '%</strong></small>';
        html += '</div></div>';
        
        html += '<table class="table table-sm mb-0"><thead><tr>';
        html += '<th>Strategy</th>';
        html += '<th class="text-end">Risk %</th>';
        html += '<th class="text-end">Expected</th>';
        html += '</tr></thead><tbody>';
        
        riskLevels.forEach((level, index) => {
            const riskAmount = (data.metrics.accountSize * level.percent / 100);
            const dailyExpected = riskAmount * (data.metrics.expectedValue / 100);
            
            setTimeout(() => {
                if (typeof document !== 'undefined' && document.querySelector) {
                    const row = document.querySelector(`#positionSizing tbody tr:nth-child(${index + 1})`);
                    if (row) {
                        row.style.opacity = '0';
                        row.style.transform = 'translateX(-10px)';
                        setTimeout(() => {
                            row.style.opacity = '1';
                            row.style.transform = 'translateX(0)';
                        }, 10);
                    }
                }
            }, index * 30);
            
            const rowClass = level.highlight ? 'table-primary' : '';
            const isOverKelly = level.percent > kellyPercent * 1.2;
            const warningIcon = isOverKelly ? '<i class="fas fa-exclamation-triangle text-danger" style="font-size: 0.7rem;"></i> ' : '';
            
            html += `
                <tr class="${rowClass}">
                    <td>
                        ${warningIcon}<strong>${level.label}</strong>
                        <br><small class="text-muted">${level.desc}</small>
                    </td>
                    <td class="text-end">
                        <strong>${level.percent.toFixed(1)}%</strong>
                        <br><small class="text-muted">$${riskAmount.toFixed(0)}</small>
                    </td>
                    <td class="text-end">
                        <strong class="${dailyExpected >= 0 ? 'text-success' : 'text-danger'}">$${dailyExpected.toFixed(0)}</strong>
                        <br><small class="text-muted">/trade</small>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        
        container.innerHTML = html;
        container.style.opacity = '1';
    }, 150);
}

// Reset form to defaults
function resetForm() {
    loadPreset('moderate');
}

// Load preset
function loadPreset(presetName) {
    const preset = presets[presetName] || customPresets[presetName];
    if (!preset) return;
    
    // Don't update account size - let user keep their own account size
    // document.getElementById('accountSize').value = preset.accountSize;
    document.getElementById('riskPercent').value = preset.riskPercent;
    document.getElementById('winRate').value = preset.winRate;
    document.getElementById('avgWin').value = preset.avgWin;
    document.getElementById('avgLoss').value = preset.avgLoss;
    document.getElementById('stopLoss').value = preset.stopLoss || 50;
    document.getElementById('contractPrice').value = preset.contractPrice || 1.00;
    document.getElementById('commission').value = preset.commission || 0.65;
    document.getElementById('tradesPerDay').value = preset.tradesPerDay;
    document.getElementById('days').value = preset.days;
    
    // Add visual feedback
    form.querySelectorAll('input').forEach(input => {
        input.classList.add('updating');
        setTimeout(() => input.classList.remove('updating'), 300);
    });
    
    runCalculation();
}

// Save custom preset
function saveCustomPreset() {
    const presetName = document.getElementById('presetName').value.trim();
    
    if (!presetName) {
        alert('Please enter a preset name');
        return;
    }
    
    if (presets[presetName.toLowerCase()]) {
        alert('This name is reserved. Please choose a different name.');
        return;
    }
    
    const params = getFormValues();
    const preset = {
        accountSize: params.accountSize,
        riskPercent: params.riskPercent * 100,
        winRate: params.winRate * 100,
        avgWin: params.avgWin * 100,
        avgLoss: params.avgLoss * 100,
        stopLoss: params.stopLoss * 100,
        contractPrice: params.contractPrice,
        commission: params.commission,
        tradesPerDay: params.tradesPerDay,
        days: params.days
    };
    
    customPresets[presetName] = preset;
    localStorage.setItem('customPresets', JSON.stringify(customPresets));
    
    // Clear input and close modal
    document.getElementById('presetName').value = '';
    savePresetModal.hide();
    
    // Render custom presets
    renderCustomPresets();
}

// Load custom presets from localStorage
function loadCustomPresets() {
    const saved = localStorage.getItem('customPresets');
    if (saved) {
        customPresets = JSON.parse(saved);
        renderCustomPresets();
    }
}

// Render custom presets
function renderCustomPresets() {
    const container = document.getElementById('customPresetsContainer');
    container.innerHTML = '';
    
    Object.keys(customPresets).forEach(name => {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-preset-wrapper';
        
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-preset';
        btn.dataset.preset = name;
        btn.innerHTML = `<i class="fas fa-star"></i> ${name}`;
        btn.addEventListener('click', () => loadPreset(name));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-preset';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteCustomPreset(name);
        });
        
        wrapper.appendChild(btn);
        wrapper.appendChild(deleteBtn);
        container.appendChild(wrapper);
    });
}

// Delete custom preset
function deleteCustomPreset(name) {
    if (confirm(`Delete preset "${name}"?`)) {
        delete customPresets[name];
        localStorage.setItem('customPresets', JSON.stringify(customPresets));
        renderCustomPresets();
    }
}

// Save values to localStorage
function saveValues(params) {
    localStorage.setItem('tradingCalculatorValues', JSON.stringify(params));
}

// Load saved values from localStorage
function loadSavedValues() {
    const saved = localStorage.getItem('tradingCalculatorValues');
    if (saved) {
        const params = JSON.parse(saved);
        document.getElementById('accountSize').value = params.accountSize;
        document.getElementById('riskPercent').value = params.riskPercent * 100;
        document.getElementById('winRate').value = params.winRate * 100;
        document.getElementById('avgWin').value = params.avgWin * 100;
        document.getElementById('avgLoss').value = params.avgLoss * 100;
        document.getElementById('tradesPerDay').value = params.tradesPerDay;
        document.getElementById('days').value = params.days;
    }
}

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

// Format percentage
function formatPercentage(value) {
    return `${(value * 100).toFixed(2)}%`;
}

// Load configuration from URL
function loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('account')) {
        document.getElementById('accountSize').value = urlParams.get('account');
        document.getElementById('riskPercent').value = urlParams.get('risk');
        document.getElementById('winRate').value = urlParams.get('win');
        document.getElementById('avgWin').value = urlParams.get('avgWin');
        document.getElementById('avgLoss').value = urlParams.get('avgLoss');
        document.getElementById('tradesPerDay').value = urlParams.get('trades');
        document.getElementById('days').value = urlParams.get('days');
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        handleSubmit,
        runCalculation,
        getFormValues,
        displayResults,
        updateMetricWithColor,
        createProjectionChart,
        createMonteCarloChart,
        populateStreakTable,
        populateDrawdownTable,
        generatePositionSizing,
        resetForm,
        loadPreset,
        saveCustomPreset,
        loadCustomPresets,
        renderCustomPresets,
        deleteCustomPreset,
        saveValues,
        loadSavedValues,
        formatCurrency,
        formatPercentage,
        loadFromURL,
        presets,
        initialize,
        initializeTooltips,
        formatProjectionTooltipTitle,
        formatProjectionTooltipLabel,
        formatYAxisTick,
        formatMonteCarloTooltipLabel,
        populateWinStreakTable,
        populateRiskOfRuinTable,
        populateTargetTable,
        populateTimeBasedTable,
        populateRecoveryTable
    };
}
