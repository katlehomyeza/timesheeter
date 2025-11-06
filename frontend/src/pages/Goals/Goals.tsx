import type { Goal, GoalPeriod, Project } from '@shared/types/project.types';
import { useState, useEffect } from 'react';
import { getProjects } from '../../services/project.service';
import { createGoal, getGoals, getGoalPeriods, updateGoal } from '../../services/goal.service';
import { isError } from '../../utils/utils';
import './Goals.css';
import ClockLoader from '../../components/ClockLoader/ClockLoader';

// Helper functions for period scaling
const DAYS_IN_PERIOD: Record<string, number> = {
    'daily': 1,
    'weekly': 7,
    'monthly': 30, // approximate
    'quarterly': 90,
    'yearly': 365
};

const getPeriodDays = (period: string): number => {
    const normalized = period.toLowerCase();
    return DAYS_IN_PERIOD[normalized] || 7; // default to weekly
};

const scaleHoursToBase = (hours: number, fromPeriod: string): number => {
    // Convert any period to daily (base unit)
    const days = getPeriodDays(fromPeriod);
    return hours / days;
};

const scaleHoursFromBase = (dailyHours: number, toPeriod: string): number => {
    // Convert from daily to target period
    const days = getPeriodDays(toPeriod);
    return dailyHours * days;
};

const scaleHoursBetweenPeriods = (hours: number, fromPeriod: string, toPeriod: string): number => {
    const dailyHours = scaleHoursToBase(hours, fromPeriod);
    return scaleHoursFromBase(dailyHours, toPeriod);
};

export default function Goals() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
    const [previousPeriod, setPreviousPeriod] = useState<string | null>(null);
    const [goalPeriods, setGoalPeriods] = useState<GoalPeriod[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingGoals, setSavingGoals] = useState<Set<string>>(new Set());
    const [goalInputs, setGoalInputs] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        async function loadInitialData() {
            setLoading(true);
            try {
                const [projectsResponse, goalsResponse, periodsResponse] = await Promise.all([
                    getProjects(),
                    getGoals(),
                    getGoalPeriods()
                ]);

                if (!isError(projectsResponse)) {
                    setProjects(projectsResponse);
                }
                if (!isError(goalsResponse)) {
                    setGoals(goalsResponse);
                }
                if (!isError(periodsResponse)) {
                    setGoalPeriods(periodsResponse);
                    if (periodsResponse.length > 0 && !selectedPeriod) {
                        const initialPeriod = periodsResponse[0].period;
                        setSelectedPeriod(initialPeriod);
                        setPreviousPeriod(initialPeriod);
                    }
                }
            } catch (error) {
                console.error('Failed to load initial data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedPeriod && goals.length > 0 && goalPeriods.length > 0) {
            const inputs: Record<string, string> = {};
            
            // For each project, find any existing goal and scale it to current period
            goals.forEach(goal => {
                const goalPeriodData = goalPeriods.find(p => p.id === goal.periodId);
                if (goalPeriodData) {
                    const scaledHours = scaleHoursBetweenPeriods(
                        Number(goal.targetHours),
                        goalPeriodData.period,
                        selectedPeriod
                    );
                    inputs[goal.projectId] = scaledHours.toFixed(1);
                }
            });
            
            setGoalInputs(inputs);
            setPreviousPeriod(selectedPeriod);
        }
    }, [selectedPeriod, goals, goalPeriods]);



    const getSelectedPeriodId = (): string | undefined => {
        return goalPeriods.find(p => p.period === selectedPeriod)?.id;
    };

    const getGoalForProject = (projectId: string): Goal | undefined => {
        // Return any goal for this project, regardless of period
        return goals.find(g => g.projectId === projectId);
    };

    const handleInputChange = (projectId: string, value: string) => {
        setGoalInputs(prev => ({ ...prev, [projectId]: value }));
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[projectId];
            return newErrors;
        });
    };

    const handleSaveGoal = async (project: Project) => {
        const periodId = getSelectedPeriodId();
        if (!periodId) {
            setErrors(prev => ({ ...prev, [project.id]: 'Please select a goal period' }));
            return;
        }

        const inputValue = goalInputs[project.id] || '';
        const targetHours = parseFloat(inputValue);

        if (!inputValue || isNaN(targetHours) || targetHours <= 0) {
            setErrors(prev => ({ ...prev, [project.id]: 'Please enter a valid number of hours' }));
            return;
        }

        setSavingGoals(prev => new Set(prev).add(project.id));

        const existingGoal = getGoalForProject(project.id);
        let response;

        if (existingGoal) {
            // Update existing goal with new period and scaled hours
            response = await updateGoal(existingGoal.id, periodId, targetHours);
        } else {
            response = await createGoal(project.id, periodId, project.name, targetHours);
        }

        if (isError(response)) {
            setErrors(prev => ({ ...prev, [project.id]: response.message }));
        } else {
            // Replace the old goal completely
            setGoals(prev => {
                const filtered = prev.filter(g => g.projectId !== project.id);
                return [...filtered, response];
            });
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[project.id];
                return newErrors;
            });
        }

        setSavingGoals(prev => {
            const newSet = new Set(prev);
            newSet.delete(project.id);
            return newSet;
        });
    };

    const calculateTotalTarget = (): number => {
        if (!selectedPeriod) return 0;
        
        return Object.entries(goalInputs).reduce((sum, [projectId, value]) => {
            const hours = parseFloat(value) || 0;
            return sum + hours;
        }, 0);
    };

    const calculateDailyAverage = (targetHours: number): number => {
        if (!selectedPeriod) return 0;
        const days = getPeriodDays(selectedPeriod);
        return targetHours / days;
    };

    if (loading) {
        return (
            <section className="goals-container loading">
                <ClockLoader></ClockLoader>
            </section>
        );
    }

    const totalTarget = calculateTotalTarget();
    const dailyAverage = calculateDailyAverage(totalTarget);

    const capitalizeFirstLetter = (str: string | null): string => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <section className="goals-container">
            <div className="goals-header">
                <h1 className="goals-title">{capitalizeFirstLetter(selectedPeriod)} Goals</h1>
                <p className="goals-subtitle">Set targets for each category</p>
            </div>

            <div className="goals-layout">
                <aside className="goals-sidebar">
                    <div className="sidebar-info">
                        <p className="sidebar-text">
                            Set your goals for the selected period. Hours automatically scale when you switch between 
                            periods - a <span className="highlight">21-hour weekly</span> goal becomes 3 hours daily or ~90 hours monthly.
                        </p>
                        <p className="sidebar-note">Goals adjust proportionally to your selected time period</p>
                    </div>

                    <section className="target-summary">
                        <h2 className="summary-title">Total {capitalizeFirstLetter(selectedPeriod)} Target</h2>
                        <p className="summary-label">Combined {selectedPeriod} target for all categories</p>
                        <h1 className="summary-hours">{totalTarget.toFixed(1)}h</h1>
                        <p className="summary-daily">Average {dailyAverage.toFixed(1)}h per day</p>
                    </section>
                </aside>

                <main className="goals-main">
                    <div className="period-selector">
                        <select
                            className="period-select"
                            value={selectedPeriod ?? ''}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
                            <option value="" disabled>
                                Select Goal Period
                            </option>
                            {goalPeriods.map((period) => (
                                <option key={period.id} value={period.period}>
                                    {period.period}
                                </option>
                            ))}
                        </select>
                    </div>

                    <section className="project-goals">
                        {projects.map(project => {
                            const goal = getGoalForProject(project.id);
                            const inputValue = goalInputs[project.id] || '';
                            const targetHours = parseFloat(inputValue) || 0;
                            const isSaving = savingGoals.has(project.id);
                            const error = errors[project.id];

                            return (
                                <article key={project.id} className="project-goal-card">
                                    <div className="card-header">
                                        <div className="project-indicator">
                                            <div className="project-color" style={{ backgroundColor: project.colorHex }}></div>
                                            <h3 className="project-name">{project.name}</h3>
                                        </div>
                                        <p className="card-subtitle">Set {selectedPeriod} target for this category</p>
                                    </div>

                                    <div className="card-body">
                                        <div className="input-section">
                                            <label className="input-label">{capitalizeFirstLetter(selectedPeriod)} Hours</label>
                                            <input
                                                type="number"
                                                className="hours-input"
                                                value={inputValue}
                                                onChange={(e) => handleInputChange(project.id, e.target.value)}
                                                placeholder="0"
                                                step="0.5"
                                                min="0"
                                            />
                                        </div>

                                        {error && <p className="error-message">{error}</p>}

                                        <div className="stats-row">
                                            <div className="stat-group">
                                                <span className="stat-label">Current daily average</span>
                                                <span className="stat-value">0h</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className={`save-button ${isSaving ? 'saving' : ''}`}
                                        onClick={() => handleSaveGoal(project)}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Goal'}
                                    </button>
                                </article>
                            );
                        })}
                    </section>
                </main>
            </div>
        </section>
    );
}