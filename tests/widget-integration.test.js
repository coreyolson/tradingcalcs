/**
 * Widget Integration Tests
 * Tests all UI widgets to ensure they work properly
 */

const request = require('supertest');
const { app } = require('../server');

describe('Widget Integration Tests', () => {
    let testData;

    beforeAll(async () => {
        // Get sample data from API
        const response = await request(app)
            .post('/api/simulate')
            .send({
                accountSize: 5000,
                riskPercent: 0.05,
                winRate: 0.7,
                avgWin: 0.6,
                avgLoss: 0.3,
                stopLoss: 0.5,
                contractPrice: 1.0,
                commission: 0.65,
                tradesPerDay: 2,
                days: 30,
                simulations: 100
            });

        testData = response.body.data;
    });

    describe('Risk of Ruin Widget', () => {
        test('should return risk of ruin data', () => {
            expect(testData.riskOfRuin).toBeDefined();
            expect(Array.isArray(testData.riskOfRuin)).toBe(true);
            expect(testData.riskOfRuin.length).toBe(4);

            testData.riskOfRuin.forEach(risk => {
                expect(risk).toHaveProperty('drawdownLevel');
                expect(risk).toHaveProperty('probability');
                expect(risk).toHaveProperty('lossesRequired');
                expect(risk.probability).toBeGreaterThanOrEqual(0);
                expect(risk.probability).toBeLessThanOrEqual(100);
            });
        });

        test('should show increasing drawdown levels', () => {
            expect(testData.riskOfRuin[0].drawdownLevel).toBe(25);
            expect(testData.riskOfRuin[1].drawdownLevel).toBe(50);
            expect(testData.riskOfRuin[2].drawdownLevel).toBe(75);
            expect(testData.riskOfRuin[3].drawdownLevel).toBe(90);
        });
    });

    describe('Target Projections Widget', () => {
        test('should return target projection data', () => {
            expect(testData.targetProjections).toBeDefined();
            expect(Array.isArray(testData.targetProjections)).toBe(true);
            expect(testData.targetProjections.length).toBe(4);

            testData.targetProjections.forEach(target => {
                expect(target).toHaveProperty('targetMultiple');
                expect(target).toHaveProperty('targetAmount');
                expect(target).toHaveProperty('daysNeeded');
                expect(target).toHaveProperty('weeksNeeded');
                expect(target).toHaveProperty('monthsNeeded');
            });
        });

        test('should show increasing target multiples', () => {
            expect(testData.targetProjections[0].targetMultiple).toBe(2);
            expect(testData.targetProjections[1].targetMultiple).toBe(3);
            expect(testData.targetProjections[2].targetMultiple).toBe(5);
            expect(testData.targetProjections[3].targetMultiple).toBe(10);
        });

        test('should calculate correct target amounts', () => {
            expect(testData.targetProjections[0].targetAmount).toBe(10000); // 5000 * 2
            expect(testData.targetProjections[1].targetAmount).toBe(15000); // 5000 * 3
        });
    });

    describe('Win Streak Widget', () => {
        test('should return win streak probabilities', () => {
            expect(testData.winStreakProbabilities).toBeDefined();
            expect(Array.isArray(testData.winStreakProbabilities)).toBe(true);

            testData.winStreakProbabilities.forEach(streak => {
                expect(streak).toHaveProperty('streak');
                expect(streak).toHaveProperty('probability');
                expect(streak).toHaveProperty('frequency');
            });
        });

        test('should show decreasing probabilities for longer streaks', () => {
            const probs = testData.winStreakProbabilities.map(s => s.probability);
            for (let i = 1; i < probs.length; i++) {
                expect(probs[i]).toBeLessThan(probs[i - 1]);
            }
        });
    });

    describe('Time-Based Analysis Widget', () => {
        test('should return time-based analysis', () => {
            expect(testData.timeBasedAnalysis).toBeDefined();
            expect(testData.timeBasedAnalysis.daily).toBeDefined();
            expect(testData.timeBasedAnalysis.weekly).toBeDefined();
            expect(testData.timeBasedAnalysis.monthly).toBeDefined();
            expect(testData.timeBasedAnalysis.quarterly).toBeDefined();

            ['daily', 'weekly', 'monthly', 'quarterly'].forEach(period => {
                expect(testData.timeBasedAnalysis[period]).toHaveProperty('trades');
                expect(testData.timeBasedAnalysis[period]).toHaveProperty('balance');
                expect(testData.timeBasedAnalysis[period]).toHaveProperty('growth');
            });
        });

        test('should show increasing trade counts', () => {
            expect(testData.timeBasedAnalysis.weekly.trades).toBeGreaterThan(
                testData.timeBasedAnalysis.daily.trades
            );
            expect(testData.timeBasedAnalysis.monthly.trades).toBeGreaterThan(
                testData.timeBasedAnalysis.weekly.trades
            );
            expect(testData.timeBasedAnalysis.quarterly.trades).toBeGreaterThan(
                testData.timeBasedAnalysis.monthly.trades
            );
        });
    });

    describe('Recovery Analysis Widget', () => {
        test('should return recovery calculations', () => {
            expect(testData.recoveryCalculations).toBeDefined();
            expect(Array.isArray(testData.recoveryCalculations)).toBe(true);
            expect(testData.recoveryCalculations.length).toBe(5);

            testData.recoveryCalculations.forEach(recovery => {
                expect(recovery).toHaveProperty('drawdownPercent');
                expect(recovery).toHaveProperty('recoveryNeeded');
                expect(recovery).toHaveProperty('winsRequired');
                expect(recovery).toHaveProperty('remainingCapital');
            });
        });

        test('should show increasing recovery requirements', () => {
            const recoveries = testData.recoveryCalculations;
            expect(recoveries[4].recoveryNeeded).toBeGreaterThan(recoveries[0].recoveryNeeded);
            expect(recoveries[4].winsRequired).toBeGreaterThan(recoveries[0].winsRequired);
        });

        test('should show 50% drawdown needs ~100% recovery', () => {
            const fifty = testData.recoveryCalculations.find(r => r.drawdownPercent === 50);
            expect(fifty.recoveryNeeded).toBeCloseTo(100, 0);
        });
    });

    describe('Sharpe Ratio Widget', () => {
        test('should return Sharpe ratio in metrics', () => {
            expect(testData.metrics).toBeDefined();
            expect(testData.metrics.sharpeRatio).toBeDefined();
            expect(typeof testData.metrics.sharpeRatio).toBe('number');
        });

        test('should calculate reasonable Sharpe ratio', () => {
            // For a good trading system, Sharpe should be positive
            expect(testData.metrics.sharpeRatio).toBeGreaterThan(-10);
            expect(testData.metrics.sharpeRatio).toBeLessThan(10);
        });
    });

    describe('Loss Streak Widget (existing)', () => {
        test('should return loss streak probabilities', () => {
            expect(testData.streakProbabilities).toBeDefined();
            expect(Array.isArray(testData.streakProbabilities)).toBe(true);

            testData.streakProbabilities.forEach(streak => {
                expect(streak).toHaveProperty('streak');
                expect(streak).toHaveProperty('probability');
                expect(streak).toHaveProperty('frequency');
            });
        });
    });

    describe('Drawdown Scenarios Widget (existing)', () => {
        test('should return drawdown scenarios', () => {
            expect(testData.drawdownScenarios).toBeDefined();
            expect(Array.isArray(testData.drawdownScenarios)).toBe(true);

            testData.drawdownScenarios.forEach(scenario => {
                expect(scenario).toHaveProperty('consecutiveLosses');
                expect(scenario).toHaveProperty('remainingBalance');
                expect(scenario).toHaveProperty('remainingPercent');
                expect(scenario).toHaveProperty('drawdown');
                expect(scenario).toHaveProperty('survivable');
            });
        });
    });

    describe('Monte Carlo Widget (existing)', () => {
        test('should return Monte Carlo results', () => {
            expect(testData.monteCarlo).toBeDefined();
            expect(testData.monteCarlo.statistics).toBeDefined();
            expect(testData.monteCarlo.histogram).toBeDefined();

            const stats = testData.monteCarlo.statistics;
            expect(stats).toHaveProperty('mean');
            expect(stats).toHaveProperty('median');
            expect(stats).toHaveProperty('percentile5');
            expect(stats).toHaveProperty('percentile95');
            expect(stats).toHaveProperty('ruinProbability');
        });
    });

    describe('Projection Chart Widget (existing)', () => {
        test('should return projection data', () => {
            expect(testData.projection).toBeDefined();
            expect(Array.isArray(testData.projection)).toBe(true);
            expect(testData.projection.length).toBeGreaterThan(0);

            testData.projection.forEach(point => {
                expect(point).toHaveProperty('day');
                expect(point).toHaveProperty('balance');
            });
        });

        test('should show account growth over time', () => {
            const first = testData.projection[0].balance;
            const last = testData.projection[testData.projection.length - 1].balance;
            
            // With positive expectancy, account should grow
            expect(last).toBeGreaterThan(first);
        });
    });

    describe('All Widgets Data Completeness', () => {
        test('should return all expected data structures', () => {
            expect(testData).toHaveProperty('metrics');
            expect(testData).toHaveProperty('projection');
            expect(testData).toHaveProperty('monteCarlo');
            expect(testData).toHaveProperty('streakProbabilities');
            expect(testData).toHaveProperty('drawdownScenarios');
            expect(testData).toHaveProperty('riskOfRuin');
            expect(testData).toHaveProperty('targetProjections');
            expect(testData).toHaveProperty('timeBasedAnalysis');
            expect(testData).toHaveProperty('recoveryCalculations');
            expect(testData).toHaveProperty('winStreakProbabilities');
        });

        test('should include Sharpe ratio in metrics', () => {
            expect(testData.metrics.sharpeRatio).toBeDefined();
        });

        test('should include simulation mode', () => {
            expect(testData.simulationMode).toBeDefined();
            expect(testData.simulationMode).toBe('stopLoss');
        });
    });
});
