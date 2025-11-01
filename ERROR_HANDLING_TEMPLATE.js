/**
 * STANDARD ERROR HANDLING TEMPLATE
 * Use this pattern for all calculator error handling
 */

// ==========================================
// 1. INPUT VALIDATION
// ==========================================
function calculate() {
    // Parse inputs (no || defaults - catch all invalid cases)
    const value1 = parseFloat(document.getElementById('input1').value);
    const value2 = parseFloat(document.getElementById('input2').value);
    
    // Validation array
    const errors = [];
    
    // Required field checks
    if (!value1 || value1 <= 0) errors.push('Value 1 must be greater than 0');
    if (isNaN(value2) || value2 < 0) errors.push('Value 2 must be 0 or greater');
    
    // Range checks
    if (value1 > 100) errors.push('Value 1 cannot exceed 100');
    
    // Logic checks
    if (value2 > value1) errors.push('Value 2 cannot exceed Value 1');
    
    // Early return on errors
    if (errors.length > 0) {
        showError(errors);
        return;
    }
    
    clearError();
    
    // ... continue with calculations
}

// ==========================================
// 2. CALCULATION VALIDATION
// ==========================================
function validateCalculation(result, name) {
    if (!isFinite(result) || isNaN(result)) {
        showError([`Invalid ${name} calculation`]);
        return false;
    }
    return true;
}

// Example usage:
const result = value1 / value2;
if (!validateCalculation(result, 'division')) return;

// ==========================================
// 3. RANGE WARNINGS
// ==========================================
function checkRangeWarnings(value, thresholds) {
    if (value > thresholds.danger) {
        showWarning(`Value ${value} is extremely high - verify calculations`, 'danger');
    } else if (value > thresholds.warning) {
        showWarning(`Value ${value} is unusually high`, 'warning');
    }
}

// Example usage:
checkRangeWarnings(leverage, { danger: 100, warning: 50 });

// ==========================================
// 4. ERROR DISPLAY FUNCTIONS
// ==========================================
function showError(errors) {
    const errorContainer = document.getElementById('errorContainer') || createErrorContainer();
    errorContainer.innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Invalid Input</strong>
            <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem;">
                ${errors.map(err => `<li>${err}</li>`).join('')}
            </ul>
        </div>
    `;
    errorContainer.style.display = 'block';
    clearResults(); // Reset all display values
}

function showWarning(message, level = 'warning') {
    const warningContainer = document.getElementById('warningContainer') || createWarningContainer();
    const alertClass = level === 'danger' ? 'alert-danger' : 'alert-warning';
    warningContainer.innerHTML = `
        <div class="alert ${alertClass}">
            <i class="fas fa-exclamation-circle"></i>
            <strong>Warning:</strong> ${message}
        </div>
    `;
    warningContainer.style.display = 'block';
}

function clearError() {
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) errorContainer.style.display = 'none';
    const warningContainer = document.getElementById('warningContainer');
    if (warningContainer) warningContainer.style.display = 'none';
}

function clearResults() {
    // Set all result fields to '--'
    document.getElementById('result1').textContent = '--';
    document.getElementById('result2').textContent = '--';
}

function createErrorContainer() {
    const container = document.createElement('div');
    container.id = 'errorContainer';
    container.style.display = 'none';
    const form = document.getElementById('calculatorForm') || document.querySelector('.compact-form');
    form.parentElement.insertBefore(container, form.nextSibling);
    return container;
}

function createWarningContainer() {
    const container = document.createElement('div');
    container.id = 'warningContainer';
    container.style.display = 'none';
    const resultsSection = document.querySelector('.row.g-3') || document.querySelector('.card-body');
    resultsSection.parentElement.insertBefore(container, resultsSection);
    return container;
}

// ==========================================
// 5. COMMON VALIDATION PATTERNS
// ==========================================

// Percentage validation (0-100%)
function validatePercentage(value, name) {
    if (isNaN(value) || value < 0 || value > 100) {
        return `${name} must be between 0% and 100%`;
    }
    return null;
}

// Positive number validation
function validatePositive(value, name) {
    if (!value || value <= 0) {
        return `${name} must be greater than 0`;
    }
    return null;
}

// Non-negative validation
function validateNonNegative(value, name) {
    if (isNaN(value) || value < 0) {
        return `${name} cannot be negative`;
    }
    return null;
}

// Division by zero check
function safeDivide(numerator, denominator, errorMessage) {
    if (denominator === 0) {
        showError([errorMessage || 'Division by zero']);
        return null;
    }
    const result = numerator / denominator;
    if (!isFinite(result) || isNaN(result)) {
        showError(['Invalid calculation result']);
        return null;
    }
    return result;
}

// ==========================================
// 6. CHART VALIDATION
// ==========================================
function validateChartData(dataArray) {
    // Check if array has invalid values
    const hasInvalidData = dataArray.some(val => !isFinite(val) || isNaN(val));
    if (hasInvalidData) {
        console.error('Invalid data in chart array, skipping render');
        return false;
    }
    // Check if all values are zero or negative (chart won't display well)
    const allZeroOrNegative = dataArray.every(val => val <= 0);
    if (allZeroOrNegative) {
        console.warn('All chart values are zero or negative');
        return false;
    }
    return true;
}

// Example usage:
function updateChart(data) {
    if (!validateChartData(data)) {
        return; // Skip chart rendering
    }
    // ... render chart
}

// ==========================================
// 7. SPECIAL CASES
// ==========================================

// Handle account at $0
function checkAccountZero(balance) {
    if (balance === 0) {
        showError(['Account balance is $0 - cannot calculate']);
        return true;
    }
    return false;
}

// Handle impossible scenarios
function checkImpossible(condition, message) {
    if (condition) {
        const errorContainer = document.getElementById('errorContainer') || createErrorContainer();
        errorContainer.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-ban"></i>
                <strong>Impossible Scenario</strong>
                <p style="margin: 0.5rem 0 0 0;">${message}</p>
            </div>
        `;
        errorContainer.style.display = 'block';
        return true;
    }
    return false;
}

// ==========================================
// 8. USAGE EXAMPLES
// ==========================================

/*
// Example 1: Simple calculator
function calculateSimple() {
    const balance = parseFloat(document.getElementById('balance').value);
    const rate = parseFloat(document.getElementById('rate').value) / 100;
    
    const errors = [];
    const balanceError = validatePositive(balance, 'Balance');
    if (balanceError) errors.push(balanceError);
    
    const rateError = validatePercentage(rate * 100, 'Rate');
    if (rateError) errors.push(rateError);
    
    if (errors.length > 0) {
        showError(errors);
        return;
    }
    
    clearError();
    
    const result = balance * rate;
    if (!validateCalculation(result, 'result')) return;
    
    document.getElementById('result').textContent = '$' + result.toFixed(2);
}

// Example 2: Division with safety
function calculateRatio() {
    const numerator = parseFloat(document.getElementById('num').value);
    const denominator = parseFloat(document.getElementById('denom').value);
    
    const errors = [];
    if (!numerator || numerator <= 0) errors.push('Numerator must be > 0');
    if (!denominator || denominator <= 0) errors.push('Denominator must be > 0');
    
    if (errors.length > 0) {
        showError(errors);
        return;
    }
    
    const ratio = safeDivide(numerator, denominator, 'Cannot divide by zero');
    if (ratio === null) return;
    
    document.getElementById('ratio').textContent = ratio.toFixed(2);
}

// Example 3: With warnings
function calculateLeverage() {
    const leverage = parseFloat(document.getElementById('leverage').value);
    
    if (!leverage || leverage <= 0) {
        showError(['Leverage must be greater than 0']);
        return;
    }
    
    clearError();
    
    // Warning system
    if (leverage > 100) {
        showWarning('Leverage above 100x is extremely dangerous', 'danger');
    } else if (leverage > 50) {
        showWarning('Leverage above 50x carries extreme risk', 'warning');
    }
    
    // ... continue calculations
}
*/
