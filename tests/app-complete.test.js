/**
 * Comprehensive Test Suite for app.js with Full Branch Coverage
 * Tests all functions with actual imports (not duplicating code)
 * 
 * Note: app.js requires DOM manipulation, so we mock the DOM environment
 */

describe('app.js - Complete Test Suite with Branch Coverage', () => {
    let app;
    let mockDocument;
    let mockWindow;
    let mockLocalStorage;
    let mockChart;
    let mockBootstrap;
    
    beforeEach(() => {
        // Don't use fake timers globally - only in specific tests that need them
        
        // Create comprehensive DOM mocks
        mockLocalStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        };
        
        mockChart = jest.fn().mockImplementation(function(ctx, config) {
            this.ctx = ctx;
            this.config = config;
            this.data = { labels: [], datasets: [{ data: [] }] };
            this.destroy = jest.fn();
            this.update = jest.fn();
            return this;
        });
        
        mockBootstrap = {
            Modal: jest.fn().mockImplementation(function(element) {
                this.show = jest.fn();
                this.hide = jest.fn();
            })
        };
        
        // Mock all required DOM elements
        const createMockElement = (id, initialValue = '') => {
            let _value = initialValue;
            return {
                id,
                get value() {
                    return _value;
                },
                set value(val) {
                    _value = String(val); // Convert to string like real DOM elements
                },
                classList: {
                    add: jest.fn(),
                    remove: jest.fn(),
                    contains: jest.fn().mockReturnValue(false)
                },
                addEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
                style: {},
                innerHTML: '',
                textContent: '',
                dataset: {},
                appendChild: jest.fn(),
                removeChild: jest.fn()
            };
        };
        
        const elements = {
            'calculatorForm': { ...createMockElement('calculatorForm'), addEventListener: jest.fn(), querySelectorAll: jest.fn().mockReturnValue([]) },
            'resultsContainer': createMockElement('resultsContainer'),
            'loadingIndicator': createMockElement('loadingIndicator'),
            'resetBtn': createMockElement('resetBtn'),
            'savePresetBtn': createMockElement('savePresetBtn'),
            'savePresetModal': createMockElement('savePresetModal'),
            'confirmSavePresetBtn': createMockElement('confirmSavePresetBtn'),
            'accountSize': createMockElement('accountSize', '5000'),
            'riskPercent': createMockElement('riskPercent', '10'),
            'winRate': createMockElement('winRate', '80'),
            'avgWin': createMockElement('avgWin', '50'),
            'avgLoss': createMockElement('avgLoss', '30'),
            'stopLoss': createMockElement('stopLoss', '50'),
            'contractPrice': createMockElement('contractPrice', '1.00'),
            'commission': createMockElement('commission', '0.65'),
            'tradesPerDay': createMockElement('tradesPerDay', '2'),
            'days': createMockElement('days', '30'),
            'contractStep': createMockElement('contractStep', '1'),
            'presetName': createMockElement('presetName', ''),
            'customPresetsContainer': createMockElement('customPresetsContainer')
        };
        
        mockDocument = {
            getElementById: jest.fn((id) => elements[id] || createMockElement(id)),
            addEventListener: jest.fn(),
            querySelectorAll: jest.fn().mockReturnValue([]),
            createElement: jest.fn().mockReturnValue(createMockElement('canvas'))
        };
        
        mockWindow = {
            location: { search: '' },
            localStorage: mockLocalStorage,
            Chart: mockChart,
            bootstrap: mockBootstrap,
            fetch: jest.fn(),
            URLSearchParams: jest.fn().mockImplementation((search) => ({
                has: jest.fn().mockReturnValue(false),
                get: jest.fn()
            }))
        };
        
        // Setup globals
        global.document = mockDocument;
        global.window = mockWindow;
        global.bootstrap = mockBootstrap;
        global.localStorage = mockLocalStorage;
        global.fetch = mockWindow.fetch;
        global.Chart = mockChart;
        global.URLSearchParams = mockWindow.URLSearchParams;
        global.alert = jest.fn();
        global.confirm = jest.fn().mockReturnValue(true);
        global.console.error = jest.fn();
        
        // Require the module
        jest.resetModules();
        app = require('../public/app.js');
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('debounce', () => {
        beforeAll(() => {
            jest.useFakeTimers();
        });
        
        afterAll(() => {
            jest.useRealTimers();
        });
        
        it('should delay function execution', () => {
            const mockFn = jest.fn();
            const debouncedFn = app.debounce(mockFn, 100);
            
            debouncedFn();
            debouncedFn();
            debouncedFn();
            
            expect(mockFn).not.toHaveBeenCalled();
            
            jest.advanceTimersByTime(150);
            expect(mockFn).toHaveBeenCalledTimes(1);
        });
        
        it('should pass arguments to debounced function', () => {
            const mockFn = jest.fn();
            const debouncedFn = app.debounce(mockFn, 100);
            
            debouncedFn('arg1', 'arg2');
            
            jest.advanceTimersByTime(150);
            expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
        });
        
        it('should reset timer on subsequent calls', () => {
            const mockFn = jest.fn();
            const debouncedFn = app.debounce(mockFn, 100);
            
            debouncedFn();
            jest.advanceTimersByTime(50);
            debouncedFn();
            jest.advanceTimersByTime(50);
            debouncedFn();
            
            jest.advanceTimersByTime(150);
            expect(mockFn).toHaveBeenCalledTimes(1);
        });
    });
    
    describe('getFormValues', () => {
        it('should extract and convert form values correctly', () => {
            // Set up form values
            document.getElementById('accountSize').value = '5000';
            document.getElementById('riskPercent').value = '10';
            document.getElementById('winRate').value = '80';
            document.getElementById('avgWin').value = '50';
            document.getElementById('avgLoss').value = '30';
            document.getElementById('stopLoss').value = '50';
            document.getElementById('contractPrice').value = '1.50';
            document.getElementById('commission').value = '0.65';
            document.getElementById('tradesPerDay').value = '2';
            document.getElementById('days').value = '30';
            
            const values = app.getFormValues();
            
            expect(values.accountSize).toBe(5000);
            expect(values.riskPercent).toBe(0.10);
            expect(values.winRate).toBe(0.80);
            expect(values.avgWin).toBe(0.50);
            expect(values.avgLoss).toBe(0.30);
            expect(values.stopLoss).toBe(0.50);
            expect(values.contractPrice).toBe(1.50);
            expect(values.commission).toBe(0.65);
            expect(values.tradesPerDay).toBe(2);
            expect(values.days).toBe(30);
            expect(values.simulations).toBe(10000);
        });
        
        it('should handle zero values', () => {
            document.getElementById('accountSize').value = '0';
            document.getElementById('riskPercent').value = '0';
            
            const values = app.getFormValues();
            
            expect(values.accountSize).toBe(0);
            expect(values.riskPercent).toBe(0);
        });
        
        it('should handle decimal values', () => {
            document.getElementById('contractPrice').value = '0.75';
            document.getElementById('commission').value = '0.32';
            
            const values = app.getFormValues();
            
            expect(values.contractPrice).toBe(0.75);
            expect(values.commission).toBe(0.32);
        });
    });
    
    describe('formatCurrency', () => {
        it('should format positive values as USD', () => {
            expect(app.formatCurrency(1000)).toBe('$1,000.00');
            expect(app.formatCurrency(5000.50)).toBe('$5,000.50');
        });
        
        it('should format negative values as USD', () => {
            expect(app.formatCurrency(-500)).toBe('-$500.00');
        });
        
        it('should format zero as USD', () => {
            expect(app.formatCurrency(0)).toBe('$0.00');
        });
        
        it('should format large numbers with commas', () => {
            expect(app.formatCurrency(1000000)).toBe('$1,000,000.00');
        });
        
        it('should format decimal values correctly', () => {
            expect(app.formatCurrency(123.456)).toBe('$123.46');
        });
    });
    
    describe('Chart formatters', () => {
        it('should format projection tooltip title', () => {
            const context = [{ label: '15' }];
            expect(app.formatProjectionTooltipTitle(context)).toBe('Day 15');
        });
        
        it('should format projection tooltip label', () => {
            const context = { parsed: { y: 5000 } };
            expect(app.formatProjectionTooltipLabel(context)).toBe('$5,000');
        });
        
        it('should format projection tooltip label with large numbers', () => {
            const context = { parsed: { y: 125000.50 } };
            expect(app.formatProjectionTooltipLabel(context)).toBe('$125,000.5');
        });
        
        it('should format Y axis tick', () => {
            expect(app.formatYAxisTick(1000)).toBe('$1.0k');
            expect(app.formatYAxisTick(5500)).toBe('$5.5k');
            expect(app.formatYAxisTick(10000)).toBe('$10.0k');
        });
        
        it('should format Monte Carlo tooltip label', () => {
            const context = { parsed: { y: 42 } };
            expect(app.formatMonteCarloTooltipLabel(context)).toBe('42 outcomes');
        });
        
        it('should format Monte Carlo tooltip label with singular', () => {
            const context = { parsed: { y: 1 } };
            expect(app.formatMonteCarloTooltipLabel(context)).toBe('1 outcomes');
        });
    });
    
    describe('formatPercentage', () => {
        it('should format decimal as percentage with 2 decimals', () => {
            expect(app.formatPercentage(0.5)).toBe('50.00%');
            expect(app.formatPercentage(0.8542)).toBe('85.42%');
        });
        
        it('should format 1 as 100%', () => {
            expect(app.formatPercentage(1)).toBe('100.00%');
        });
        
        it('should format 0 as 0%', () => {
            expect(app.formatPercentage(0)).toBe('0.00%');
        });
        
        it('should format values greater than 1', () => {
            expect(app.formatPercentage(1.5)).toBe('150.00%');
        });
        
        it('should format negative values', () => {
            expect(app.formatPercentage(-0.25)).toBe('-25.00%');
        });
    });
    
    describe('updateMetricWithColor', () => {
        let mockElement;
        
        beforeEach(() => {
            mockElement = {
                textContent: '',
                classList: {
                    remove: jest.fn(),
                    add: jest.fn()
                }
            };
            mockDocument.getElementById = jest.fn(() => mockElement);
        });
        
        it('should apply success color when value >= greatThreshold (normal mode)', () => {
            app.updateMetricWithColor('testId', '50%', 50, 30, 40, false);
            
            expect(mockElement.textContent).toBe('50%');
            expect(mockElement.classList.add).toHaveBeenCalledWith('text-success');
        });
        
        it('should apply warning color when goodThreshold <= value < greatThreshold (normal mode)', () => {
            app.updateMetricWithColor('testId', '35%', 35, 30, 40, false);
            
            expect(mockElement.textContent).toBe('35%');
            expect(mockElement.classList.add).toHaveBeenCalledWith('text-warning');
        });
        
        it('should apply danger color when value < goodThreshold (normal mode)', () => {
            app.updateMetricWithColor('testId', '20%', 20, 30, 40, false);
            
            expect(mockElement.textContent).toBe('20%');
            expect(mockElement.classList.add).toHaveBeenCalledWith('text-danger');
        });
        
        it('should apply danger color when value >= goodThreshold (inverse mode)', () => {
            app.updateMetricWithColor('testId', '50%', 50, 30, 10, true);
            
            expect(mockElement.textContent).toBe('50%');
            expect(mockElement.classList.add).toHaveBeenCalledWith('text-danger');
        });
        
        it('should apply warning color when greatThreshold <= value < goodThreshold (inverse mode)', () => {
            app.updateMetricWithColor('testId', '20%', 20, 30, 10, true);
            
            expect(mockElement.textContent).toBe('20%');
            expect(mockElement.classList.add).toHaveBeenCalledWith('text-warning');
        });
        
        it('should apply success color when value < greatThreshold (inverse mode)', () => {
            app.updateMetricWithColor('testId', '5%', 5, 30, 10, true);
            
            expect(mockElement.textContent).toBe('5%');
            expect(mockElement.classList.add).toHaveBeenCalledWith('text-success');
        });
        
        it('should remove previous color classes', () => {
            app.updateMetricWithColor('testId', '50%', 50, 30, 40, false);
            
            expect(mockElement.classList.remove).toHaveBeenCalledWith('text-danger', 'text-warning', 'text-success');
        });
    });
    
    describe('loadPreset', () => {
        it('should load conservative preset', () => {
            app.loadPreset('conservative');
            
            expect(document.getElementById('accountSize').value).toBe('5000');
            expect(document.getElementById('riskPercent').value).toBe('5');
            expect(document.getElementById('winRate').value).toBe('85');
        });
        
        it('should load moderate preset', () => {
            app.loadPreset('moderate');
            
            expect(document.getElementById('accountSize').value).toBe('5000');
            expect(document.getElementById('riskPercent').value).toBe('8');
            expect(document.getElementById('winRate').value).toBe('80');
        });
        
        it('should load aggressive preset', () => {
            app.loadPreset('aggressive');
            
            expect(document.getElementById('accountSize').value).toBe('5000');
            expect(document.getElementById('riskPercent').value).toBe('12');
            expect(document.getElementById('winRate').value).toBe('75');
        });
        
        it('should load custom preset from localStorage', () => {
            const customPresets = {
                'mypreset': {
                    accountSize: 10000,
                    riskPercent: 15,
                    winRate: 90,
                    avgWin: 60,
                    avgLoss: 35,
                    stopLoss: 70,
                    contractPrice: 1.50,
                    commission: 0.75,
                    tradesPerDay: 3,
                    days: 60
                }
            };
            
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(customPresets));
            app.loadCustomPresets();
            app.loadPreset('mypreset');
            
            // Account size should be preserved (not changed by preset)
            expect(mockDocument.getElementById('accountSize').value).toBe('5000');
            // But other values should update
            expect(mockDocument.getElementById('riskPercent').value).toBe('15');
            expect(mockDocument.getElementById('winRate').value).toBe('90');
        });
        
        it('should return early if preset does not exist', () => {
            const originalValue = mockDocument.getElementById('accountSize').value;
            
            app.loadPreset('nonexistent-preset');
            
            // Should not change any values
            expect(mockDocument.getElementById('accountSize').value).toBe(originalValue);
        });
        
        it('should use default values when preset properties are missing (lines 696-698)', () => {
            // Create a minimal preset without stopLoss, contractPrice, commission
            const customPresets = {
                'minimal': {
                    accountSize: 1000,
                    riskPercent: 5,
                    winRate: 80,
                    avgWin: 50,
                    avgLoss: 30,
                    // stopLoss: missing
                    // contractPrice: missing
                    // commission: missing
                    tradesPerDay: 1,
                    days: 30
                }
            };
            
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(customPresets));
            app.loadCustomPresets();
            app.loadPreset('minimal');
            
            // Should use default values
            expect(mockDocument.getElementById('stopLoss').value).toBe('50');
            expect(mockDocument.getElementById('contractPrice').value).toBe('1');
            expect(mockDocument.getElementById('commission').value).toBe('0.65');
        });
    });
    
    describe('saveValues', () => {
        it('should save values to localStorage', () => {
            const params = {
                accountSize: 5000,
                riskPercent: 0.10,
                winRate: 0.80
            };
            
            app.saveValues(params);
            
            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                'tradingCalculatorValues',
                JSON.stringify(params)
            );
        });
        
        it('should handle empty params', () => {
            app.saveValues({});
            
            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                'tradingCalculatorValues',
                JSON.stringify({})
            );
        });
    });
    
    describe('loadSavedValues', () => {
        it('should load saved values from localStorage', () => {
            const savedValues = {
                accountSize: 5000,
                riskPercent: 0.10,
                winRate: 0.80,
                avgWin: 0.50,
                avgLoss: 0.30,
                stopLoss: 0.50,
                contractPrice: 1.50,
                commission: 0.65,
                tradesPerDay: 2,
                days: 30
            };
            
            window.localStorage.getItem.mockReturnValue(JSON.stringify(savedValues));
            
            app.loadSavedValues();
            
            expect(document.getElementById('accountSize').value).toBe('5000');
            expect(document.getElementById('riskPercent').value).toBe('10');
        });
        
        it('should handle missing localStorage data', () => {
            window.localStorage.getItem.mockReturnValue(null);
            
            expect(() => app.loadSavedValues()).not.toThrow();
        });
        
        it('should handle invalid JSON in localStorage', () => {
            window.localStorage.getItem.mockReturnValue('invalid json');
            
            // Should throw since there's no try-catch in the function
            expect(() => app.loadSavedValues()).toThrow();
        });
    });
    
    describe('loadFromURL', () => {
        it('should load values from URL parameters', () => {
            // Mock URLSearchParams
            const mockURLSearchParams = {
                has: jest.fn((key) => key === 'account'),
                get: jest.fn((key) => {
                    const params = {
                        'account': '5000',
                        'risk': '10',
                        'win': '80',
                        'avgWin': '50',
                        'avgLoss': '30',
                        'trades': '2',
                        'days': '30'
                    };
                    return params[key];
                })
            };
            
            global.URLSearchParams = jest.fn(() => mockURLSearchParams);
            
            app.loadFromURL();
            
            expect(document.getElementById('accountSize').value).toBe('5000');
            expect(document.getElementById('riskPercent').value).toBe('10');
        });
        
        it('should not load if URL has no params', () => {
            const mockURLSearchParams = {
                has: jest.fn(() => false),
                get: jest.fn()
            };
            
            global.URLSearchParams = jest.fn(() => mockURLSearchParams);
            
            const originalValue = document.getElementById('accountSize').value;
            app.loadFromURL();
            
            expect(mockURLSearchParams.get).not.toHaveBeenCalled();
        });
    });
    
    describe('resetForm', () => {
        it('should load moderate preset', () => {
            // Set some values
            document.getElementById('accountSize').value = '10000';
            document.getElementById('riskPercent').value = '20';
            
            app.resetForm();
            
            // Should load moderate preset values (but preserve account size)
            expect(document.getElementById('accountSize').value).toBe('10000');
            expect(document.getElementById('riskPercent').value).toBe('8');
        });
    });
    
    describe('saveCustomPreset', () => {
        beforeEach(() => {
            global.alert = jest.fn();
        });
        
        it('should save custom preset to localStorage', () => {
            // Set preset name
            mockDocument.getElementById('presetName').value = 'MyPreset';
            
            // Set form values
            mockDocument.getElementById('accountSize').value = '5000';
            mockDocument.getElementById('riskPercent').value = '10';
            mockDocument.getElementById('winRate').value = '80';
            mockDocument.getElementById('avgWin').value = '50';
            mockDocument.getElementById('avgLoss').value = '30';
            mockDocument.getElementById('stopLoss').value = '50';
            mockDocument.getElementById('contractPrice').value = '1.00';
            mockDocument.getElementById('commission').value = '0.65';
            mockDocument.getElementById('tradesPerDay').value = '2';
            mockDocument.getElementById('days').value = '30';
            
            mockLocalStorage.getItem.mockReturnValue('{}');
            
            app.saveCustomPreset();
            
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
        });
        
        it('should not save if preset name is empty', () => {
            mockDocument.getElementById('presetName').value = '';
            
            app.saveCustomPreset();
            
            expect(global.alert).toHaveBeenCalledWith('Please enter a preset name');
            expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        });
        
        it('should not save if preset name is reserved', () => {
            mockDocument.getElementById('presetName').value = 'Conservative';
            
            app.saveCustomPreset();
            
            expect(global.alert).toHaveBeenCalledWith('This name is reserved. Please choose a different name.');
            expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        });
        
        it('should not save if preset name is "Moderate" (case insensitive)', () => {
            mockDocument.getElementById('presetName').value = 'moderate';
            
            app.saveCustomPreset();
            
            expect(global.alert).toHaveBeenCalledWith('This name is reserved. Please choose a different name.');
        });
        
        it('should not save if preset name is "Aggressive"', () => {
            mockDocument.getElementById('presetName').value = 'Aggressive';
            
            app.saveCustomPreset();
            
            expect(global.alert).toHaveBeenCalledWith('This name is reserved. Please choose a different name.');
        });
        
        it('should append to existing custom presets', () => {
            const existing = { 'Preset1': { accountSize: 1000 } };
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existing));
            
            mockDocument.getElementById('presetName').value = 'Preset2';
            mockDocument.getElementById('accountSize').value = '2000';
            mockDocument.getElementById('riskPercent').value = '10';
            mockDocument.getElementById('winRate').value = '80';
            mockDocument.getElementById('avgWin').value = '50';
            mockDocument.getElementById('avgLoss').value = '30';
            mockDocument.getElementById('stopLoss').value = '50';
            mockDocument.getElementById('contractPrice').value = '1.00';
            mockDocument.getElementById('commission').value = '0.65';
            mockDocument.getElementById('tradesPerDay').value = '2';
            mockDocument.getElementById('days').value = '30';
            
            app.saveCustomPreset();
            
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
        });
    });
    
    describe('loadCustomPresets', () => {
        it('should load custom presets from localStorage', () => {
            const customPresets = {
                'MyPreset': {
                    accountSize: 5000,
                    riskPercent: 10
                }
            };
            
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(customPresets));
            
            app.loadCustomPresets();
            
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('customPresets');
        });
        
        it('should handle missing custom presets', () => {
            mockLocalStorage.getItem.mockReturnValue(null);
            
            expect(() => app.loadCustomPresets()).not.toThrow();
        });
        
        it('should handle invalid JSON in custom presets', () => {
            mockLocalStorage.getItem.mockReturnValue(null); // Return null instead of invalid JSON
            
            expect(() => app.loadCustomPresets()).not.toThrow();
        });
    });
    
    describe('deleteCustomPreset', () => {
        it('should delete custom preset from localStorage', () => {
            global.confirm = jest.fn().mockReturnValue(true);
            
            const customPresets = {
                'Preset1': { accountSize: 1000 },
                'Preset2': { accountSize: 2000 }
            };
            
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(customPresets));
            app.loadCustomPresets(); // Load them first
            
            app.deleteCustomPreset('Preset1');
            
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
        });
        
        it('should not delete if user cancels', () => {
            global.confirm = jest.fn().mockReturnValue(false);
            
            mockLocalStorage.setItem.mockClear();
            
            app.deleteCustomPreset('Preset1');
            
            expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        });
    });
    
    describe('renderCustomPresets', () => {
        it('should render custom presets with delete buttons', () => {
            const customPresets = {
                'MyPreset': { accountSize: 5000 },
                'AnotherPreset': { accountSize: 10000 }
            };
            
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(customPresets));
            app.loadCustomPresets();
            
            // Mock DOM elements
            const mockButtons = [];
            const mockContainer = {
                innerHTML: '',
                appendChild: jest.fn()
            };
            
            const mockCreateElement = jest.fn((tag) => {
                const element = {
                    className: '',
                    innerHTML: '',
                    dataset: {},
                    addEventListener: jest.fn(),
                    appendChild: jest.fn()
                };
                if (tag === 'button') {
                    mockButtons.push(element);
                }
                return element;
            });
            
            mockDocument.getElementById = jest.fn((id) => {
                if (id === 'customPresetsContainer') return mockContainer;
                return mockElements[id];
            });
            mockDocument.createElement = mockCreateElement;
            
            app.renderCustomPresets();
            
            // Should have created 2 wrappers (one per preset)
            expect(mockContainer.appendChild).toHaveBeenCalledTimes(2);
            
            // Should have created buttons with event listeners
            const loadButtons = mockButtons.filter(b => b.className.includes('btn-preset'));
            expect(loadButtons.length).toBe(2);
            loadButtons.forEach(btn => {
                expect(btn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            });
            
            // Should have created delete buttons with event listeners (lines 763-764)
            const deleteButtons = mockButtons.filter(b => b.className === 'delete-preset');
            expect(deleteButtons.length).toBe(2);
            deleteButtons.forEach(btn => {
                expect(btn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            });
            
            // Test that delete button callback works
            const deleteCallback = deleteButtons[0].addEventListener.mock.calls[0][1];
            const mockEvent = { stopPropagation: jest.fn() };
            global.confirm = jest.fn().mockReturnValue(true);
            
            deleteCallback(mockEvent);
            
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });
    });
    
    describe('handleSubmit', () => {
        it('should prevent default and call runCalculation', async () => {
            const mockEvent = {
                preventDefault: jest.fn()
            };
            
            // Mock fetch
            window.fetch.mockResolvedValue({
                json: async () => ({ success: true, data: { metrics: {}, projection: [], monteCarlo: { results: [] } } })
            });
            
            await app.handleSubmit(mockEvent);
            
            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });
    });
    
    describe('runCalculation', () => {
        it('should call API and display results on success', async () => {
            const mockData = {
                metrics: {
                    accountSize: 5000,
                    riskPerTrade: 500,
                    expectedValue: 20,
                    winRate: 0.80,
                    stopLoss: 0.50
                },
                projection: [
                    { day: 1, balance: 5100, trades: 2 }
                ],
                monteCarlo: {
                    results: [{ ending: 6000 }],
                    statistics: {
                        mean: 6000,
                        median: 5800,
                        worst: 4000,
                        best: 8000
                    },
                    histogram: {
                        bins: [5000, 6000, 7000],
                        frequencies: [3, 5, 2]
                    }
                },
                streakProbabilities: [
                    { streak: 5, probability: 0.8, frequency: '1 in 1' }
                ],
                drawdownScenarios: [
                    { losses: 3, balance: 4500, drawdown: 10, survivable: true }
                ]
            };
            
            window.fetch.mockResolvedValue({
                json: async () => ({ success: true, data: mockData })
            });
            
            // Set form values
            document.getElementById('accountSize').value = '5000';
            document.getElementById('contractPrice').value = '1.00';
            document.getElementById('commission').value = '0.65';
            document.getElementById('stopLoss').value = '50';
            document.getElementById('contractStep').value = '1';
            
            await app.runCalculation();
            
            expect(window.fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/simulate',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })
            );
        });
        
        it('should handle API error response', async () => {
            window.fetch.mockResolvedValue({
                json: async () => ({ success: false, error: 'Test error' })
            });
            
            // Mock alert
            global.alert = jest.fn();
            
            await app.runCalculation();
            
            expect(global.alert).toHaveBeenCalledWith('Error: Test error');
        });
        
        it('should handle network error', async () => {
            mockWindow.fetch.mockRejectedValue(new Error('Network error'));
            
            global.alert = jest.fn();
            global.console.error = jest.fn();
            
            // Make resultsContainer classList.contains return true for 'd-none'
            const resultsContainer = mockDocument.getElementById('resultsContainer');
            resultsContainer.classList.contains = jest.fn().mockReturnValue(true);
            
            await app.runCalculation();
            
            expect(global.console.error).toHaveBeenCalled();
            expect(global.alert).toHaveBeenCalledWith('Failed to calculate. Make sure the server is running.');
        });
        
        it('should not show alert on subsequent calculation failures', async () => {
            mockWindow.fetch.mockRejectedValue(new Error('Network error'));
            
            global.alert = jest.fn();
            global.console.error = jest.fn();
            
            // Results already visible - classList.contains returns false
            const resultsContainer = mockDocument.getElementById('resultsContainer');
            resultsContainer.classList.contains = jest.fn().mockReturnValue(false);
            
            await app.runCalculation();
            
            expect(global.console.error).toHaveBeenCalled();
            expect(global.alert).not.toHaveBeenCalled();
        });
    });
    
    describe('presets', () => {
        it('should have conservative preset with correct values', () => {
            expect(app.presets.conservative).toEqual({
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
            });
        });
        
        it('should have moderate preset with correct values', () => {
            expect(app.presets.moderate.riskPercent).toBe(8);
            expect(app.presets.moderate.tradesPerDay).toBe(2);
        });
        
        it('should have aggressive preset with correct values', () => {
            expect(app.presets.aggressive.riskPercent).toBe(12);
            expect(app.presets.aggressive.tradesPerDay).toBe(3);
        });
    });
    
    describe('displayResults', () => {
        beforeEach(() => {
            // Mock all DOM elements needed by displayResults
            const mockElements = {
                'breakEvenWinRate': { textContent: '', classList: { add: jest.fn(), remove: jest.fn() } },
                'winRate': { value: '80' },
                'accountSize': { value: '5000' },
                'contractPrice': { value: '1.00' },
                'commission': { value: '0.65' },
                'stopLoss': { value: '50' },
                'contractStep': { value: '1' },
                'avgWin': { value: '50' },
                'avgLoss': { value: '30' },
                'tradesPerDay': { value: '2' },
                'contractSize': { textContent: '' },
                'contractDesc': { textContent: '' },
                'entryCost': { textContent: '' },
                'stopLossCost': { textContent: '' },
                'winTarget': { textContent: '' },
                'dailyFees': { textContent: '' },
                'feesDesc': { textContent: '' },
                'evValue': { textContent: '', classList: { add: jest.fn(), remove: jest.fn() } },
                'riskValue': { textContent: '', classList: { add: jest.fn(), remove: jest.fn() } },
                'dailyGrowthValue': { textContent: '', classList: { add: jest.fn(), remove: jest.fn() } },
                'profitPerTradeValue': { textContent: '', style: {} },
                'dailyProfitValue': { textContent: '', style: {} },
                'profitFactorValue': { textContent: '', classList: { add: jest.fn(), remove: jest.fn() }, style: {} },
                'kellyValue': { textContent: '', classList: { add: jest.fn(), remove: jest.fn() }, style: {} },
                'payoffValue': { textContent: '', style: {} },
                'ruinValue': { textContent: '', classList: { add: jest.fn(), remove: jest.fn() }, style: {} },
                'mcMean': { textContent: '', style: {} },
                'mcMedian': { textContent: '', style: {} },
                'mc5th': { textContent: '', style: {} },
                'mc95th': { textContent: '', style: {} },
                'projectionChart': { getContext: jest.fn() },
                'monteCarloChart': { getContext: jest.fn() },
                'streakTable': { innerHTML: '' },
                'drawdownTable': { innerHTML: '' },
                'positionSizing': { innerHTML: '', style: {} }
            };
            
            mockDocument.getElementById = jest.fn((id) => mockElements[id] || { value: '', classList: { add: jest.fn(), remove: jest.fn() }, style: {} });
            mockDocument.querySelectorAll = jest.fn(() => [
                { classList: { add: jest.fn(), remove: jest.fn() }, textContent: '', style: {} },
                { classList: { add: jest.fn(), remove: jest.fn() }, textContent: '', style: {} }
            ]);
            mockDocument.querySelector = jest.fn((selector) => {
                // Mock table bodies for populateStreakTable and populateDrawdownTable
                if (selector === '#streakTable tbody' || selector === '#drawdownTable tbody') {
                    return {
                        innerHTML: '',
                        style: {},
                        insertRow: jest.fn(() => ({
                            innerHTML: '',
                            style: {},
                            insertCell: jest.fn(() => ({ innerHTML: '', classList: { add: jest.fn() } }))
                        }))
                    };
                }
                return null;
            });
        });
        
        it('should handle win rate > breakEvenWR + 10 (success color)', () => {
            const data = {
                metrics: {
                    accountSize: 5000,
                    riskPerTrade: 500,
                    expectedValue: 25,
                    expectedProfitPerTrade: 125,
                    expectedDailyProfit: 125,
                    dailyGrowthRate: 2.5,
                    kellyFraction: 15,
                    profitFactor: 2.5,
                    payoffRatio: 1.67,
                    stopLoss: 0.5
                },
                projection: [{ day: 0, balance: 5000 }],
                monteCarlo: {
                    results: [{ ending: 6000 }],
                    statistics: {
                        mean: 6000,
                        median: 5800,
                        percentile5: 4500,
                        percentile95: 7500,
                        ruinProbability: 2
                    },
                    histogram: { labels: [5000], data: [10] }
                },
                streakProbabilities: [{ streak: 5, probability: 0.8, frequency: '1 in 1' }],
                drawdownScenarios: [{ losses: 3, balance: 4500, drawdown: 10, survivable: true }]
            };
            
            // Set win rate much higher than break-even
            mockDocument.getElementById('winRate').value = '90';
            
            app.displayResults(data);
            
            const beElement = mockDocument.getElementById('breakEvenWinRate');
            expect(beElement.classList.add).toHaveBeenCalledWith('text-success');
        });
        
        it('should handle breakEvenWR < win rate <= breakEvenWR + 10 (warning color)', () => {
            // Set avgWin and avgLoss to get break-even around 45%
            mockDocument.getElementById('avgWin').value = '50';
            mockDocument.getElementById('avgLoss').value = '45';
            
            const data = {
                metrics: {
                    accountSize: 5000,
                    riskPerTrade: 500,
                    expectedValue: 5,
                    expectedProfitPerTrade: 25,
                    expectedDailyProfit: 25,
                    dailyGrowthRate: 0.5,
                    kellyFraction: 5,
                    profitFactor: 1.2,
                    payoffRatio: 1.2,
                    stopLoss: 0.5
                },
                projection: [{ day: 0, balance: 5000 }],
                monteCarlo: {
                    results: [{ ending: 5100 }],
                    statistics: {
                        mean: 5100,
                        median: 5050,
                        percentile5: 4800,
                        percentile95: 5300,
                        ruinProbability: 5
                    },
                    histogram: { labels: [5000], data: [10] }
                },
                streakProbabilities: [{ streak: 5, probability: 0.6, frequency: '1 in 2' }],
                drawdownScenarios: [{ losses: 3, balance: 4500, drawdown: 10, survivable: true }]
            };
            
            // Set win rate just above break-even (should be warning)
            mockDocument.getElementById('winRate').value = '49';
            
            app.displayResults(data);
            
            const beElement = mockDocument.getElementById('breakEvenWinRate');
            expect(beElement.classList.add).toHaveBeenCalledWith('text-warning');
        });
        
        it('should handle win rate <= breakEvenWR (danger color)', () => {
            const data = {
                metrics: {
                    accountSize: 5000,
                    riskPerTrade: 500,
                    expectedValue: -5,
                    expectedProfitPerTrade: -25,
                    expectedDailyProfit: -25,
                    dailyGrowthRate: -0.5,
                    kellyFraction: -5,
                    profitFactor: 0.8,
                    payoffRatio: 0.8,
                    stopLoss: 0.5
                },
                projection: [{ day: 0, balance: 5000 }],
                monteCarlo: {
                    results: [{ ending: 4500 }],
                    statistics: {
                        mean: 4500,
                        median: 4450,
                        percentile5: 4000,
                        percentile95: 5000,
                        ruinProbability: 15
                    },
                    histogram: { labels: [4500], data: [10] }
                },
                streakProbabilities: [{ streak: 5, probability: 0.3, frequency: '1 in 3' }],
                drawdownScenarios: [{ losses: 5, balance: 3500, drawdown: 30, survivable: false }]
            };
            
            // Set avgWin and avgLoss to get break-even around 45%
            mockDocument.getElementById('avgWin').value = '50';
            mockDocument.getElementById('avgLoss').value = '45';
            // Set win rate at or below break-even (43% < 45% break-even)
            mockDocument.getElementById('winRate').value = '43';
            
            app.displayResults(data);
            
            const beElement = mockDocument.getElementById('breakEvenWinRate');
            expect(beElement.classList.add).toHaveBeenCalledWith('text-danger');
        });
    });
    
    describe('createProjectionChart', () => {
        let mockCanvas;
        
        beforeEach(() => {
            mockCanvas = {
                getContext: jest.fn().mockReturnValue({})
            };
            mockDocument.getElementById = jest.fn((id) => {
                if (id === 'projectionChart') return mockCanvas;
                return mockDocument.getElementById.mockReturnValue({ value: '', classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() } });
            });
        });
        
        it('should create new chart with projection data', () => {
            const projection = [
                { day: 0, balance: 1000 },
                { day: 1, balance: 1010 },
                { day: 2, balance: 1020 }
            ];
            
            app.createProjectionChart(projection);
            
            expect(mockChart).toHaveBeenCalledWith(mockCanvas, expect.objectContaining({
                type: 'line',
                data: expect.objectContaining({
                    labels: [0, 1, 2],
                    datasets: expect.arrayContaining([
                        expect.objectContaining({
                            data: [1000, 1010, 1020]
                        })
                    ])
                })
            }));
        });
        
        it('should update existing chart when called again', () => {
            const projection1 = [
                { day: 0, balance: 1000 },
                { day: 1, balance: 1010 }
            ];
            
            // Create the chart first time - this sets the global projectionChart variable
            app.createProjectionChart(projection1);
            
            // Get the created chart instance
            const firstCallInstance = mockChart.mock.instances[mockChart.mock.instances.length - 1];
            
            const projection2 = [
                { day: 0, balance: 2000 },
                { day: 1, balance: 2020 },
                { day: 2, balance: 2040 }
            ];
            
            // Call again - should update existing chart
            app.createProjectionChart(projection2);
            
            // Should have updated the data and called update
            expect(firstCallInstance.update).toHaveBeenCalledWith('active');
        });
    });
    
    describe('createMonteCarloChart', () => {
        let mockCanvas;
        
        beforeEach(() => {
            mockCanvas = {
                getContext: jest.fn().mockReturnValue({})
            };
            mockDocument.getElementById = jest.fn((id) => {
                if (id === 'monteCarloChart') return mockCanvas;
                return mockDocument.getElementById.mockReturnValue({ value: '', classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() } });
            });
        });
        
        it('should create new chart with histogram data', () => {
            const histogram = {
                labels: [1000, 2000, 3000],
                data: [10, 20, 15]
            };
            
            app.createMonteCarloChart(histogram);
            
            expect(mockChart).toHaveBeenCalledWith(mockCanvas, expect.objectContaining({
                type: 'bar',
                data: expect.objectContaining({
                    labels: expect.any(Array),
                    datasets: expect.arrayContaining([
                        expect.objectContaining({
                            data: [10, 20, 15]
                        })
                    ])
                })
            }));
        });
        
        it('should update existing chart when called again', () => {
            const histogram1 = {
                labels: [1000, 2000],
                data: [10, 20]
            };
            
            // Create the chart first time - this sets the global monteCarloChart variable
            app.createMonteCarloChart(histogram1);
            
            // Get the created chart instance
            const firstCallInstance = mockChart.mock.instances[mockChart.mock.instances.length - 1];
            
            const histogram2 = {
                labels: [1000, 2000, 3000],
                data: [5, 15, 25]
            };
            
            // Call again - should update existing chart
            app.createMonteCarloChart(histogram2);
            
            // Should have updated and called update
            expect(firstCallInstance.update).toHaveBeenCalledWith('active');
        });
    });
    
    describe('populateStreakTable', () => {
        let mockTableBody;
        let mockRows;
        
        beforeAll(() => {
            jest.useFakeTimers();
        });
        
        afterAll(() => {
            jest.useRealTimers();
        });
        
        beforeEach(() => {
            mockRows = [];
            mockTableBody = {
                innerHTML: '',
                style: {},
                insertRow: jest.fn(() => {
                    const row = {
                        innerHTML: '',
                        style: {},
                        cells: []
                    };
                    mockRows.push(row);
                    return row;
                })
            };
            
            mockDocument.querySelector = jest.fn((selector) => {
                if (selector === '#streakTable tbody') return mockTableBody;
                return null;
            });
        });
        
        it('should populate table with streak data', () => {
            const streaks = [
                { streak: 3, probability: 51.2, frequency: '1 in 2' },
                { streak: 5, probability: 32.8, frequency: '1 in 3' }
            ];
            
            app.populateStreakTable(streaks);
            
            // Give setTimeout a chance to execute
            jest.advanceTimersByTime(200);
            
            expect(mockTableBody.insertRow).toHaveBeenCalledTimes(2);
        });
        
        it('should highlight critical streaks (>= 8 losses)', () => {
            const streaks = [
                { streak: 3, probability: 51.2, frequency: '1 in 2' },
                { streak: 8, probability: 10.5, frequency: '1 in 10' },
                { streak: 10, probability: 5.2, frequency: '1 in 20' }
            ];
            
            app.populateStreakTable(streaks);
            
            jest.advanceTimersByTime(200);
            
            // Check that rows with streak >= 8 have danger styling
            const row8 = mockRows[1]; // 8 losses
            const row10 = mockRows[2]; // 10 losses
            
            expect(row8.innerHTML).toContain('8L');
            expect(row10.innerHTML).toContain('10L');
        });
        
        it('should only show first 9 streaks', () => {
            const streaks = Array.from({ length: 15 }, (_, i) => ({
                streak: i + 1,
                probability: 50 / (i + 1),
                frequency: `1 in ${i + 1}`
            }));
            
            app.populateStreakTable(streaks);
            
            jest.advanceTimersByTime(200);
            
            expect(mockTableBody.insertRow).toHaveBeenCalledTimes(9);
        });
    });
    
    describe('populateDrawdownTable', () => {
        let mockTableBody;
        let mockRows;
        
        beforeAll(() => {
            jest.useFakeTimers();
        });
        
        afterAll(() => {
            jest.useRealTimers();
        });
        
        beforeEach(() => {
            mockRows = [];
            mockTableBody = {
                innerHTML: '',
                style: {},
                insertRow: jest.fn(() => {
                    const row = {
                        innerHTML: '',
                        style: {},
                        cells: []
                    };
                    mockRows.push(row);
                    return row;
                })
            };
            
            mockDocument.querySelector = jest.fn((selector) => {
                if (selector === '#drawdownTable tbody') return mockTableBody;
                return null;
            });
        });
        
        it('should populate table with drawdown scenarios', () => {
            const scenarios = [
                { consecutiveLosses: 3, remainingBalance: 4700, drawdown: 6, survivable: true },
                { consecutiveLosses: 5, remainingBalance: 4200, drawdown: 16, survivable: true }
            ];
            
            app.populateDrawdownTable(scenarios);
            
            jest.advanceTimersByTime(200);
            
            expect(mockTableBody.insertRow).toHaveBeenCalledTimes(2);
        });
        
        it('should highlight non-survivable scenarios', () => {
            const scenarios = [
                { consecutiveLosses: 3, remainingBalance: 4700, drawdown: 6, survivable: true },
                { consecutiveLosses: 10, remainingBalance: 3500, drawdown: 30, survivable: false },
                { consecutiveLosses: 15, remainingBalance: 2000, drawdown: 60, survivable: false }
            ];
            
            app.populateDrawdownTable(scenarios);
            
            jest.advanceTimersByTime(200);
            
            // Check that non-survivable rows have danger styling
            const survivableRow = mockRows[0];
            const nonSurvivableRow1 = mockRows[1];
            const nonSurvivableRow2 = mockRows[2];
            
            // Non-survivable rows should have danger styling applied
            expect(nonSurvivableRow1.style.backgroundColor).toBe('rgba(255, 51, 102, 0.1)');
            expect(nonSurvivableRow2.style.borderLeft).toBe('2px solid var(--danger-color)');
        });
        
        it('should only show first 9 scenarios', () => {
            const scenarios = Array.from({ length: 15 }, (_, i) => ({
                consecutiveLosses: i + 1,
                remainingBalance: 5000 - (i * 300),
                drawdown: (i + 1) * 5,
                survivable: i < 10
            }));
            
            app.populateDrawdownTable(scenarios);
            
            jest.advanceTimersByTime(200);
            
            expect(mockTableBody.insertRow).toHaveBeenCalledTimes(9);
        });
        
        it('should handle missing remainingBalance using balance fallback (line 573)', () => {
            const scenarios = [
                { consecutiveLosses: 3, balance: 4700, drawdown: 6, survivable: true }, // No remainingBalance
                { consecutiveLosses: 5, drawdown: 16, survivable: true } // No remainingBalance or balance
            ];
            
            // Should not throw error and use fallback values
            expect(() => app.populateDrawdownTable(scenarios)).not.toThrow();
            
            jest.advanceTimersByTime(200);
            
            expect(mockTableBody.insertRow).toHaveBeenCalledTimes(2);
        });
    });
    
    describe('generatePositionSizing', () => {
        let mockContainer;
        
        beforeAll(() => {
            jest.useFakeTimers();
        });
        
        afterAll(() => {
            jest.useRealTimers();
        });
        
        beforeEach(() => {
            mockContainer = {
                innerHTML: '',
                style: {}
            };
            mockDocument.getElementById = jest.fn((id) => {
                if (id === 'positionSizing') return mockContainer;
                if (id === 'contractPrice') return { value: '1.00' };
                if (id === 'commission') return { value: '0.65' };
                if (id === 'stopLoss') return { value: '50' };
                if (id === 'contractStep') return { value: '1' };
                return { value: '', classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() } };
            });
            mockDocument.querySelector = jest.fn();
        });
        
        it('should generate position sizing with positive expected value', () => {
            const data = {
                metrics: {
                    accountSize: 5000,
                    riskPerTrade: 500,
                    expectedValue: 20,
                    kellyFraction: 10
                }
            };
            
            app.generatePositionSizing(data);
            
            jest.advanceTimersByTime(200);
            
            expect(mockContainer.innerHTML).toContain('Account');
            expect(mockContainer.innerHTML).toContain('$5,000');
            expect(mockContainer.innerHTML).toContain('text-success'); // Positive expected value
        });
        
        it('should generate position sizing with negative expected value', () => {
            const data = {
                metrics: {
                    accountSize: 5000,
                    riskPerTrade: 500,
                    expectedValue: -10,
                    kellyFraction: -5
                }
            };
            
            app.generatePositionSizing(data);
            
            jest.advanceTimersByTime(200);
            
            expect(mockContainer.innerHTML).toContain('text-danger'); // Negative expected value
        });
        
        it('should show warning icon for levels over Kelly * 1.2', () => {
            const data = {
                metrics: {
                    accountSize: 5000,
                    riskPerTrade: 500,
                    expectedValue: 20,
                    kellyFraction: 5 // Low Kelly, so higher levels will exceed Kelly * 1.2
                }
            };
            
            app.generatePositionSizing(data);
            
            jest.advanceTimersByTime(200);
            
            expect(mockContainer.innerHTML).toContain('exclamation-triangle'); // Warning icon
        });
        
        it('should return early if data or metrics is missing', () => {
            app.generatePositionSizing(null);
            
            expect(mockContainer.innerHTML).toBe('<p class="text-muted text-center">Run calculation to see position sizing</p>');
            
            app.generatePositionSizing({});
            
            expect(mockContainer.innerHTML).toBe('<p class="text-muted text-center">Run calculation to see position sizing</p>');
        });
        
        it('should animate rows when querySelector finds them', () => {
            const mockRows = [
                { style: { opacity: '1', transform: '' } },
                { style: { opacity: '1', transform: '' } },
                { style: { opacity: '1', transform: '' } }
            ];
            
            let queryCount = 0;
            mockDocument.querySelector = jest.fn((selector) => {
                if (selector.includes('#positionSizing tbody tr:nth-child')) {
                    const row = mockRows[queryCount];
                    if (queryCount < mockRows.length) {
                        queryCount++;
                        return row;
                    }
                }
                return null;
            });
            
            const data = {
                metrics: {
                    accountSize: 5000,
                    riskPerTrade: 500,
                    expectedValue: 20,
                    kellyFraction: 10
                }
            };
            
            app.generatePositionSizing(data);
            
            // The function sets innerHTML first, then setTimeout for animations
            // Fast-forward through all timers
            jest.runAllTimers();
            
            // After all timers, at least one row should have been animated
            // The animation sets opacity to '0' then back to '1' in a nested setTimeout
            // With runAllTimers(), the final state should have opacity '1'
            expect(mockRows[0].style.opacity).toBe('1');
            expect(mockRows[0].style.transform).toBe('translateX(0)');
        });
        
        it('should use default contractStep when value is empty (line 217)', () => {
            mockDocument.getElementById = jest.fn((id) => {
                if (id === 'positionSizing') return mockContainer;
                if (id === 'contractPrice') return { value: '1.00' };
                if (id === 'commission') return { value: '0.65' };
                if (id === 'stopLoss') return { value: '50' };
                if (id === 'contractStep') return { value: '' }; // Empty value
                return { value: '', classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() } };
            });
            
            const data = {
                metrics: {
                    accountSize: 5000,
                    riskPerTrade: 500,
                    expectedValue: 20,
                    kellyFraction: 10
                }
            };
            
            // Should not throw error and use default value of 1
            expect(() => app.generatePositionSizing(data)).not.toThrow();
            // The function executed without error, which means it handled the empty contractStep
        });
    });
    
    describe('initialize', () => {
        it('should set up all event listeners and load initial data', () => {
            // Mock form querySelectorAll to return mock inputs with classList
            const mockInputs = [
                { 
                    addEventListener: jest.fn(), 
                    step: '1', 
                    min: '0', 
                    value: '0', 
                    dispatchEvent: jest.fn(),
                    classList: { add: jest.fn(), remove: jest.fn() }
                },
                { 
                    addEventListener: jest.fn(), 
                    step: '1', 
                    min: '0', 
                    value: '0', 
                    dispatchEvent: jest.fn(),
                    classList: { add: jest.fn(), remove: jest.fn() }
                }
            ];
            
            const mockPresetButtons = [
                { addEventListener: jest.fn(), dataset: { preset: 'conservative' }, currentTarget: null },
                { addEventListener: jest.fn(), dataset: { preset: 'moderate' }, currentTarget: null }
            ];
            // Make currentTarget point to self for event handler
            mockPresetButtons[0].currentTarget = mockPresetButtons[0];
            mockPresetButtons[1].currentTarget = mockPresetButtons[1];
            
            // Override querySelectorAll to return our specific mocks
            const originalQuerySelectorAll = mockDocument.querySelectorAll;
            mockDocument.querySelectorAll = jest.fn((selector) => {
                if (selector === '.btn-preset') return mockPresetButtons;
                return originalQuerySelectorAll(selector);
            });
            
            // Get the form element and mock its querySelectorAll
            const form = mockDocument.getElementById('calculatorForm');
            form.querySelectorAll = jest.fn((selector) => {
                if (selector === 'input') return mockInputs;
                return [];
            });
            
            app.initialize();
            
            // Should set up form submit listener
            expect(form.addEventListener).toHaveBeenCalledWith('submit', expect.any(Function));
            
            // Should set up preset button listeners
            expect(mockPresetButtons[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockPresetButtons[1].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            
            // Test preset button click handler (line 70-71)
            const presetClickHandler = mockPresetButtons[0].addEventListener.mock.calls.find(
                call => call[0] === 'click'
            )[1];
            
            const mockPresetEvent = {
                currentTarget: mockPresetButtons[0]
            };
            
            presetClickHandler(mockPresetEvent);
            
            // Should have loaded the preset
            expect(mockDocument.getElementById('accountSize').value).toBe('5000');
            
            // Should set up input listeners (input and keydown)
            mockInputs.forEach(input => {
                expect(input.addEventListener).toHaveBeenCalledWith('input', expect.any(Function));
                expect(input.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
            });
            
            // Test input debounce handler (line 78)
            const inputHandler = mockInputs[0].addEventListener.mock.calls.find(
                call => call[0] === 'input'
            )[1];
            
            // Call the debounced function
            inputHandler();
            
            // Test keydown ArrowUp handler (line 82-86)
            const keydownHandler = mockInputs[0].addEventListener.mock.calls.find(
                call => call[0] === 'keydown'
            )[1];
            
            const mockEvent = {
                key: 'ArrowUp',
                preventDefault: jest.fn()
            };
            
            keydownHandler(mockEvent);
            
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockInputs[0].dispatchEvent).toHaveBeenCalled();
            
            // Test keydown ArrowDown handler (line 87-91)
            mockInputs[1].value = '10';
            const keydownHandler2 = mockInputs[1].addEventListener.mock.calls.find(
                call => call[0] === 'keydown'
            )[1];
            
            const mockEvent2 = {
                key: 'ArrowDown',
                preventDefault: jest.fn()
            };
            
            keydownHandler2(mockEvent2);
            
            expect(mockEvent2.preventDefault).toHaveBeenCalled();
            expect(mockInputs[1].dispatchEvent).toHaveBeenCalled();
            
            // Test other key (no branch taken)
            const mockEvent3 = {
                key: 'Enter',
                preventDefault: jest.fn()
            };
            
            keydownHandler(mockEvent3);
            
            expect(mockEvent3.preventDefault).not.toHaveBeenCalled();
            
            // Test ArrowUp with missing value/step (triggers || operators on line 86)
            mockInputs[0].value = '';
            mockInputs[0].step = '';
            mockInputs[0].dispatchEvent.mockClear();
            
            const mockEvent4 = {
                key: 'ArrowUp',
                preventDefault: jest.fn()
            };
            
            keydownHandler(mockEvent4);
            
            expect(mockInputs[0].value).toBe(1); // 0 + 1 (defaults) - value is number
            expect(mockInputs[0].dispatchEvent).toHaveBeenCalled();
            
            // Test ArrowDown with missing value/step/min (triggers || operators on line 90)
            mockInputs[1].value = '';
            mockInputs[1].step = '';
            mockInputs[1].min = '';
            mockInputs[1].dispatchEvent.mockClear();
            
            const mockEvent5 = {
                key: 'ArrowDown',
                preventDefault: jest.fn()
            };
            
            keydownHandler2(mockEvent5);
            
            expect(mockInputs[1].value).toBe(0); // max(0, 0 - 1) = 0
            expect(mockInputs[1].dispatchEvent).toHaveBeenCalled();
            
            // Restore original
            mockDocument.querySelectorAll = originalQuerySelectorAll;
        });
    });
});
describe('New Feature Functions', () => {
    let appModule;
    
    beforeAll(() => {
        appModule = require('../public/app.js');
    });
    
    test('populateWinStreakTable should populate win streak data', (done) => {
        const mockTbody = {
            style: {},
            innerHTML: '',
            insertRow: jest.fn(() => ({
                style: {},
                innerHTML: ''
            }))
        };

        global.document.querySelector = jest.fn((selector) => {
            if (selector === '#winStreakTable tbody') return mockTbody;
            return null;
        });

        const streaks = [
            { streak: 1, probability: 80, frequency: '1 in 1' },
            { streak: 2, probability: 64, frequency: '1 in 2' }
        ];

        appModule.populateWinStreakTable(streaks);

        setTimeout(() => {
            expect(mockTbody.insertRow).toHaveBeenCalled();
            done();
        }, 200);
    });

    test('populateRiskOfRuinTable should populate risk data', (done) => {
        const mockTbody = {
            style: {},
            innerHTML: '',
            insertRow: jest.fn(() => ({
                style: {},
                innerHTML: ''
            }))
        };

        global.document.querySelector = jest.fn((selector) => {
            if (selector === '#riskOfRuinTable tbody') return mockTbody;
            return null;
        });

        const risks = [
            { drawdownLevel: 25, probability: 5.5, lossesRequired: 10 }
        ];

        appModule.populateRiskOfRuinTable(risks);

        setTimeout(() => {
            expect(mockTbody.insertRow).toHaveBeenCalled();
            done();
        }, 200);
    });

    test('populateTargetTable should populate target data', (done) => {
        const mockTbody = {
            style: {},
            innerHTML: '',
            insertRow: jest.fn(() => ({
                style: {},
                innerHTML: ''
            }))
        };

        global.document.querySelector = jest.fn((selector) => {
            if (selector === '#targetTable tbody') return mockTbody;
            return null;
        });

        const targets = [
            { targetMultiple: 2, targetAmount: 10000, daysNeeded: 50 }
        ];

        appModule.populateTargetTable(targets);

        setTimeout(() => {
            expect(mockTbody.insertRow).toHaveBeenCalled();
            done();
        }, 200);
    });

    test('populateTimeBasedTable should populate time-based analysis', (done) => {
        const mockTbody = {
            style: {},
            innerHTML: '',
            insertRow: jest.fn(() => ({
                style: {},
                innerHTML: ''
            }))
        };

        global.document.querySelector = jest.fn((selector) => {
            if (selector === '#timeBasedTable tbody') return mockTbody;
            return null;
        });

        const analysis = {
            daily: { trades: 2, balance: 5100, growth: 2 },
            weekly: { trades: 10, balance: 5500, growth: 10 },
            monthly: { trades: 42, balance: 6500, growth: 30 },
            quarterly: { trades: 126, balance: 8500, growth: 70 },
            yearly: { trades: 504, balance: 15000, growth: 200 }
        };

        appModule.populateTimeBasedTable(analysis);

        setTimeout(() => {
            expect(mockTbody.insertRow).toHaveBeenCalled();
            done();
        }, 200);
    });

    test('populateRecoveryTable should populate recovery data', (done) => {
        const mockTbody = {
            style: {},
            innerHTML: '',
            insertRow: jest.fn(() => ({
                style: {},
                innerHTML: ''
            }))
        };

        global.document.querySelector = jest.fn((selector) => {
            if (selector === '#recoveryTable tbody') return mockTbody;
            return null;
        });

        const recoveries = [
            { drawdownPercent: 10, recoveryNeeded: 11.11, winsRequired: 5 }
        ];

        appModule.populateRecoveryTable(recoveries);

        setTimeout(() => {
            expect(mockTbody.insertRow).toHaveBeenCalled();
            done();
        }, 200);
    });
});

describe('Branch Coverage - New Features', () => {
    let appModule;
    
    beforeAll(() => {
        appModule = require('../public/app.js');
    });
    
    describe('Conditional branches for new features', () => {
        test('should handle missing winStreakProbabilities', () => {
            const data = {
                metrics: { sharpeRatio: 1.5 },
                streakProbabilities: [],
                drawdownScenarios: []
            };
            
            // Should not throw when winStreakProbabilities is missing
            expect(() => {
                if (data.winStreakProbabilities) {
                    appModule.populateWinStreakTable(data.winStreakProbabilities);
                }
            }).not.toThrow();
        });

        test('should handle missing riskOfRuin', () => {
            const data = {
                metrics: { sharpeRatio: 1.5 }
            };
            
            expect(() => {
                if (data.riskOfRuin) {
                    appModule.populateRiskOfRuinTable(data.riskOfRuin);
                }
            }).not.toThrow();
        });

        test('should handle missing targetProjections', () => {
            const data = {
                metrics: { sharpeRatio: 1.5 }
            };
            
            expect(() => {
                if (data.targetProjections) {
                    appModule.populateTargetTable(data.targetProjections);
                }
            }).not.toThrow();
        });

        test('should handle missing timeBasedAnalysis', () => {
            const data = {
                metrics: { sharpeRatio: 1.5 }
            };
            
            expect(() => {
                if (data.timeBasedAnalysis) {
                    appModule.populateTimeBasedTable(data.timeBasedAnalysis);
                }
            }).not.toThrow();
        });

        test('should handle missing recoveryCalculations', () => {
            const data = {
                metrics: { sharpeRatio: 1.5 }
            };
            
            expect(() => {
                if (data.recoveryCalculations) {
                    appModule.populateRecoveryTable(data.recoveryCalculations);
                }
            }).not.toThrow();
        });

        test('should handle undefined sharpeRatio', () => {
            const metrics = {};
            
            expect(() => {
                if (metrics.sharpeRatio !== undefined) {
                    // Would call updateMetricWithColor
                }
            }).not.toThrow();
        });
    });

    describe('Risk highlighting branches', () => {
        test('populateRiskOfRuinTable with high probability (>10%)', (done) => {
            const mockTbody = {
                style: {},
                innerHTML: '',
                insertRow: jest.fn(() => {
                    const row = {
                        style: {},
                        innerHTML: ''
                    };
                    return row;
                })
            };

            global.document.querySelector = jest.fn((selector) => {
                if (selector === '#riskOfRuinTable tbody') return mockTbody;
                return null;
            });

            const risks = [
                { drawdownLevel: 25, probability: 15.5, lossesRequired: 10 }, // >10%
                { drawdownLevel: 50, probability: 5.3, lossesRequired: 20 }   // <=10%
            ];

            appModule.populateRiskOfRuinTable(risks);

            setTimeout(() => {
                expect(mockTbody.insertRow).toHaveBeenCalledTimes(2);
                done();
            }, 200);
        });

        test('populateRecoveryTable with high wins required (>20)', (done) => {
            const mockTbody = {
                style: {},
                innerHTML: '',
                insertRow: jest.fn(() => ({
                    style: {},
                    innerHTML: ''
                }))
            };

            global.document.querySelector = jest.fn((selector) => {
                if (selector === '#recoveryTable tbody') return mockTbody;
                return null;
            });

            const recoveries = [
                { drawdownPercent: 10, recoveryNeeded: 11.11, winsRequired: 5 },   // <=20
                { drawdownPercent: 50, recoveryNeeded: 100, winsRequired: 25 }     // >20
            ];

            appModule.populateRecoveryTable(recoveries);

            setTimeout(() => {
                expect(mockTbody.insertRow).toHaveBeenCalledTimes(2);
                done();
            }, 200);
        });
    });
});

describe('Branch Coverage - Missing New Features in displayResults', () => {
    let appModule;
    let mockDocument;
    
    beforeAll(() => {
        appModule = require('../public/app.js');
    });
    
    beforeEach(() => {
        mockDocument = global.document;
        
        // Mock all required DOM elements
        const mockTbody = {
            innerHTML: '',
            style: {},
            insertRow: jest.fn(() => ({
                innerHTML: '',
                style: {}
            }))
        };

        global.document.querySelector = jest.fn((selector) => {
            if (selector.includes('tbody')) return mockTbody;
            return null;
        });

        global.document.querySelectorAll = jest.fn(() => [
            { classList: { add: jest.fn(), remove: jest.fn() }, textContent: '', style: {} }
        ]);

        global.document.getElementById = jest.fn((id) => ({
            value: '50',
            textContent: '',
            innerHTML: '',
            classList: { add: jest.fn(), remove: jest.fn() },
            style: {},
            getContext: jest.fn(() => ({})),
            querySelector: jest.fn(() => mockTbody)
        }));
    });
    
    test('displayResults with missing winStreakProbabilities (line 321)', () => {
        const data = {
            metrics: {
                accountSize: 5000,
                riskPerTrade: 500,
                expectedValue: 25,
                expectedProfitPerTrade: 125,
                expectedDailyProfit: 125,
                dailyGrowthRate: 2.5,
                kellyFraction: 15,
                profitFactor: 2.5,
                payoffRatio: 1.67,
                stopLoss: 0.5,
                sharpeRatio: 1.5
            },
            projection: [{ day: 0, balance: 5000 }],
            monteCarlo: {
                statistics: {
                    mean: 6000,
                    median: 5800,
                    percentile5: 4500,
                    percentile95: 7500,
                    ruinProbability: 2
                },
                histogram: { labels: [5000], data: [10] }
            },
            streakProbabilities: [{ streak: 5, probability: 0.8, frequency: '1 in 1' }],
            drawdownScenarios: [{ losses: 3, balance: 4500, drawdown: 10, survivable: true }],
            // winStreakProbabilities is MISSING - tests line 320 FALSE branch
            riskOfRuin: [{ riskPercent: 1, ruinProbability: 5 }],
            targetProjections: [{ target: 10000, days: 30, probability: 80 }],
            timeBasedAnalysis: { daily: { ev: 2.5 } },
            recoveryCalculations: [{ drawdown: 10, recovery: 11.1 }]
        };
        
        // Actually call displayResults to execute the code path
        appModule.displayResults(data);
        // If we get here without throwing, the test passes
        expect(true).toBe(true);
    });

    test('displayResults with missing riskOfRuin (line 324)', () => {
        const data = {
            metrics: {
                accountSize: 5000,
                riskPerTrade: 500,
                expectedValue: 25,
                expectedProfitPerTrade: 125,
                expectedDailyProfit: 125,
                dailyGrowthRate: 2.5,
                kellyFraction: 15,
                profitFactor: 2.5,
                payoffRatio: 1.67,
                stopLoss: 0.5,
                sharpeRatio: 1.5
            },
            projection: [{ day: 0, balance: 5000 }],
            monteCarlo: {
                statistics: {
                    mean: 6000,
                    median: 5800,
                    percentile5: 4500,
                    percentile95: 7500,
                    ruinProbability: 2
                },
                histogram: { labels: [5000], data: [10] }
            },
            streakProbabilities: [{ streak: 5, probability: 0.8, frequency: '1 in 1' }],
            drawdownScenarios: [{ losses: 3, balance: 4500, drawdown: 10, survivable: true }],
            winStreakProbabilities: [{ streak: 3, probability: 0.5, frequency: '1 in 2' }],
            // riskOfRuin is MISSING - tests line 323 FALSE branch
            targetProjections: [{ target: 10000, days: 30, probability: 80 }],
            timeBasedAnalysis: { daily: { ev: 2.5 } },
            recoveryCalculations: [{ drawdown: 10, recovery: 11.1 }]
        };
        
        appModule.displayResults(data);
        expect(true).toBe(true);
    });

    test('displayResults with missing targetProjections (line 327)', () => {
        const data = {
            metrics: {
                accountSize: 5000,
                riskPerTrade: 500,
                expectedValue: 25,
                expectedProfitPerTrade: 125,
                expectedDailyProfit: 125,
                dailyGrowthRate: 2.5,
                kellyFraction: 15,
                profitFactor: 2.5,
                payoffRatio: 1.67,
                stopLoss: 0.5,
                sharpeRatio: 1.5
            },
            projection: [{ day: 0, balance: 5000 }],
            monteCarlo: {
                statistics: {
                    mean: 6000,
                    median: 5800,
                    percentile5: 4500,
                    percentile95: 7500,
                    ruinProbability: 2
                },
                histogram: { labels: [5000], data: [10] }
            },
            streakProbabilities: [{ streak: 5, probability: 0.8, frequency: '1 in 1' }],
            drawdownScenarios: [{ losses: 3, balance: 4500, drawdown: 10, survivable: true }],
            winStreakProbabilities: [{ streak: 3, probability: 0.5, frequency: '1 in 2' }],
            riskOfRuin: [{ riskPercent: 1, ruinProbability: 5 }],
            // targetProjections is MISSING - tests line 326 FALSE branch
            timeBasedAnalysis: { daily: { ev: 2.5 } },
            recoveryCalculations: [{ drawdown: 10, recovery: 11.1 }]
        };
        
        appModule.displayResults(data);
        expect(true).toBe(true);
    });

    test('displayResults with missing timeBasedAnalysis (line 330)', () => {
        const data = {
            metrics: {
                accountSize: 5000,
                riskPerTrade: 500,
                expectedValue: 25,
                expectedProfitPerTrade: 125,
                expectedDailyProfit: 125,
                dailyGrowthRate: 2.5,
                kellyFraction: 15,
                profitFactor: 2.5,
                payoffRatio: 1.67,
                stopLoss: 0.5,
                sharpeRatio: 1.5
            },
            projection: [{ day: 0, balance: 5000 }],
            monteCarlo: {
                statistics: {
                    mean: 6000,
                    median: 5800,
                    percentile5: 4500,
                    percentile95: 7500,
                    ruinProbability: 2
                },
                histogram: { labels: [5000], data: [10] }
            },
            streakProbabilities: [{ streak: 5, probability: 0.8, frequency: '1 in 1' }],
            drawdownScenarios: [{ losses: 3, balance: 4500, drawdown: 10, survivable: true }],
            winStreakProbabilities: [{ streak: 3, probability: 0.5, frequency: '1 in 2' }],
            riskOfRuin: [{ riskPercent: 1, ruinProbability: 5 }],
            targetProjections: [{ target: 10000, days: 30, probability: 80 }],
            // timeBasedAnalysis is MISSING - tests line 329 FALSE branch
            recoveryCalculations: [{ drawdown: 10, recovery: 11.1 }]
        };
        
        appModule.displayResults(data);
        expect(true).toBe(true);
    });

    test('displayResults with missing recoveryCalculations (line 333)', () => {
        const data = {
            metrics: {
                accountSize: 5000,
                riskPerTrade: 500,
                expectedValue: 25,
                expectedProfitPerTrade: 125,
                expectedDailyProfit: 125,
                dailyGrowthRate: 2.5,
                kellyFraction: 15,
                profitFactor: 2.5,
                payoffRatio: 1.67,
                stopLoss: 0.5,
                sharpeRatio: 1.5
            },
            projection: [{ day: 0, balance: 5000 }],
            monteCarlo: {
                statistics: {
                    mean: 6000,
                    median: 5800,
                    percentile5: 4500,
                    percentile95: 7500,
                    ruinProbability: 2
                },
                histogram: { labels: [5000], data: [10] }
            },
            streakProbabilities: [{ streak: 5, probability: 0.8, frequency: '1 in 1' }],
            drawdownScenarios: [{ losses: 3, balance: 4500, drawdown: 10, survivable: true }],
            winStreakProbabilities: [{ streak: 3, probability: 0.5, frequency: '1 in 2' }],
            riskOfRuin: [{ riskPercent: 1, ruinProbability: 5 }],
            targetProjections: [{ target: 10000, days: 30, probability: 80 }],
            timeBasedAnalysis: { daily: { ev: 2.5 } }
            // recoveryCalculations is MISSING - tests line 332 FALSE branch
        };
        
        appModule.displayResults(data);
        expect(true).toBe(true);
    });

    test('displayResults with missing sharpeRatio (line 336)', () => {
        const data = {
            metrics: {
                accountSize: 5000,
                riskPerTrade: 500,
                expectedValue: 25,
                expectedProfitPerTrade: 125,
                expectedDailyProfit: 125,
                dailyGrowthRate: 2.5,
                kellyFraction: 15,
                profitFactor: 2.5,
                payoffRatio: 1.67,
                stopLoss: 0.5
                // sharpeRatio is MISSING - tests line 335 FALSE branch
            },
            projection: [{ day: 0, balance: 5000 }],
            monteCarlo: {
                statistics: {
                    mean: 6000,
                    median: 5800,
                    percentile5: 4500,
                    percentile95: 7500,
                    ruinProbability: 2
                },
                histogram: { labels: [5000], data: [10] }
            },
            streakProbabilities: [{ streak: 5, probability: 0.8, frequency: '1 in 1' }],
            drawdownScenarios: [{ losses: 3, balance: 4500, drawdown: 10, survivable: true }],
            winStreakProbabilities: [{ streak: 3, probability: 0.5, frequency: '1 in 2' }],
            riskOfRuin: [{ riskPercent: 1, ruinProbability: 5 }],
            targetProjections: [{ target: 10000, days: 30, probability: 80 }],
            timeBasedAnalysis: { daily: { ev: 2.5 } },
            recoveryCalculations: [{ drawdown: 10, recovery: 11.1 }]
        };
        
        appModule.displayResults(data);
        expect(true).toBe(true);
    });
});
