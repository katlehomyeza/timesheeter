import { useState, useEffect } from 'react';
import { Clock, Calendar, Target, TrendingUp } from 'lucide-react';
import { addWeeks, subWeeks, startOfWeek, format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import './Dashboard.css'
import React from 'react';
import ClockLoader from '../../components/ClockLoader/ClockLoader';
import type { Goal, GoalPeriod, ProjectWithTotalMinutes, TimeLog } from '@shared/types/project.types';
import { getGoals, getGoalPeriods } from '../../services/goal.service';
import { getProjectsWithTotalTimes } from '../../services/project.service';
import { isError } from '../../utils/utils';
import { getDailyTimeLog } from '../../services/timelog.service';
import type { ErrorDetail } from '@shared/types/utility.types';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [weeklyTimes, setWeeklyTimes] = useState<TimeLog[][]>([]);
  const [projects, setProjects] = useState<ProjectWithTotalMinutes[]>([]);
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalPeriods, setGoalPeriods] = useState<GoalPeriod[]>([]);

  const handlePreviousWeek = () => {
    setSelectedWeekStart(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setSelectedWeekStart(prev => addWeeks(prev, 1));
  };

  const formattedWeek = `${format(selectedWeekStart, 'MMM d')} - ${format(addWeeks(selectedWeekStart, 1), 'MMM d, yyyy')}`;

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [projectsResponse, goalsResponse, periodsResponse, weeklyTimeResponse] = await Promise.all([
          getProjectsWithTotalTimes(),
          getGoals(),
          getGoalPeriods(),
          getTimeGivenWeek(selectedWeekStart),
        ]);

        if (!isError(projectsResponse)) {
          setProjects(projectsResponse);
        }
        if (!isError(goalsResponse)) {
          setGoals(goalsResponse);
        }
        if (!isError(periodsResponse)) {
          setGoalPeriods(periodsResponse);
        }

        const sanitizedWeek = weeklyTimeResponse.map(time => 
          isError(time) ? [] : time
        );
        setWeeklyTimes(sanitizedWeek);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadWeekData() {
      setLoading(true);
      try {
        const weeklyTimeResponse = await getTimeGivenWeek(selectedWeekStart);
        const sanitizedWeek = weeklyTimeResponse.map(time => 
          isError(time) ? [] : time
        );
        setWeeklyTimes(sanitizedWeek);
      } catch (error) {
        console.error('Failed to load weekly data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadWeekData();
  }, [selectedWeekStart]);

  async function getTimeGivenWeek(weekStart: Date): Promise<(ErrorDetail | TimeLog[])[]> {
    const week: Date[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      week.push(day);
    }

    return await Promise.all(
      week.map(day => getDailyTimeLog(format(day, 'yyyy-MM-dd')))
    );
  }


  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const today = new Date();
  const todayIndex = today.getDay();

  const todayLogs = weeklyTimes[todayIndex] || [];

  const weekTotal = weeklyTimes.reduce((sum, dayLogs) => {
    return sum + dayLogs.reduce((daySum, log) => daySum + (log.durationMinutes || 0), 0);
  }, 0);

  const totalTime = Math.floor(projects.reduce((acc, project) => {
    return acc + (project.totalMinutes || 0);
  }, 0) / 60);

  const  normalizeTarget = (targetHours: number, period: string): number =>{
    const targetMinutes = targetHours * 60;
    switch (period) {
      case 'daily':
        return targetMinutes;
      case 'weekly':
        return targetMinutes / 7;
      case 'monthly':
        return targetMinutes / 30;
      default:
        return 0;
    }
  }

  const dailyProgress = (() => {
    const progressValues: number[] = [];

    for (const project of projects) {
      const matchingGoal = goals.find(goal => goal.projectId === project.id);
      const matchingPeriod = goalPeriods.find(gp => matchingGoal?.periodId === gp.id);

      let dailyTargetMinutes = 0;
      if (matchingGoal && matchingPeriod) {
        dailyTargetMinutes = normalizeTarget(matchingGoal.targetHours, matchingPeriod.period);
      }

      const logsForProjectToday = matchingGoal
        ? todayLogs.filter(log => log.projectId === project.id)
        : [];

      const minutesLoggedToday = logsForProjectToday.reduce(
        (sum, log) => sum + (log.durationMinutes || 0),
        0
      );

      const percentageComplete = dailyTargetMinutes > 0
        ? Math.min((minutesLoggedToday / dailyTargetMinutes) * 100, 100)
        : 0;

      if (percentageComplete > 0) {
        progressValues.push(percentageComplete);
      }
    }

    const totalProgress = progressValues.reduce((sum, value) => sum + value, 0);
    const averageProgress = progressValues.length > 0
      ? totalProgress / progressValues.length
      : 0;

    return Math.round(averageProgress);
  })();




  if (loading) {
    return <ClockLoader />;
  }

  return (
    <>
      <section className="dashboard">
        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-header">
              <h2 className="stat-title">Total Hours Recorded</h2>
              <Clock className="stat-icon" size={24} />
            </div>
            <div className="stats-value">{totalTime}</div>
            <div className="stat-label">Across all categories</div>
          </article>
          
          <article className="stat-card">
            <div className="stat-header">
              <h2 className="stat-title">This Week</h2>
              <Calendar className="stat-icon" size={24} />
            </div>
            <div className="stats-value">{formatTime(weekTotal * 60)}</div>
            <div className="stat-label">Total time logged</div>
          </article>
          
          <article className="stat-card">
            <div className="stat-header">
              <h2 className="stat-title">Goals completed</h2>
              <Target className="stat-icon" size={24} />
            </div>
            <div className="stats-value">{dailyProgress}%</div>
            <div className="stat-label">Of daily targets</div>
          </article>
          
          <article className="stat-card">
            <div className="stat-header">
              <h2 className="stat-title">Projects</h2>
              <TrendingUp className="stat-icon" size={24} />
            </div>
            <div className="stats-value">{projects.length}</div>
            <div className="stat-label">Active projects</div>
          </article>
        </section>
        
        {projects.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Today's Progress by Category</h2>
              <p className="section-subtitle">Track your progress towards daily goals</p>
            </div>
            {goals.length === 0 && <p>Add some goals for yourself</p>}
            
            {goals.length > 0 && (
              <div className="categories-list">
                {projects.map(project => {
                  const goal = goals.find(g => g.projectId === project.id);
                  const matchingPeriod = goalPeriods.find(goalPeriod => goalPeriod.id === goal?.periodId)
                  if (!goal || !matchingPeriod) return null;

                  const todayProjectLogs = todayLogs.filter(log => log.projectId === project.id);
                  const todayMinutes = todayProjectLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
                  const targetMinutes = Math.floor(normalizeTarget(goal.targetHours,matchingPeriod.period));
                  const percentage = Math.round((todayMinutes / targetMinutes) * 100);
                  
                  return (
                    <article key={project.id} className="category-items">
                      <div className="category-header">
                        <div className="category-name">
                          <span 
                            className="category-dot" 
                            style={{ backgroundColor: project.colorHex }}
                          />
                          <span>{project.name}</span>
                        </div>
                        <div className="category-stats">
                          <span className="category-time">{formatTime(todayMinutes * 60)}</span>
                          <span className="category-target">
                            /{formatTime(targetMinutes * 60)}
                          </span>
                          <span className="category-percentage">{percentage}%</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: project.colorHex
                          }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
        
        <section className="section weekly-grid">
          <div className="weekly-header">
            <h2 className="weekly-title">Weekly Overview</h2>

            <div className="week-navigator">
              <button className="nav-btn" onClick={handlePreviousWeek}>
                <ChevronLeft size={20} />
              </button>

              <span className="week-label">{formattedWeek}</span>

              <button
                className="nav-btn"
                onClick={handleNextWeek}
                disabled={selectedWeekStart >= startOfWeek(new Date(), { weekStartsOn: 0 })}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <p className="section-subtitle" style={{ marginBottom: 'var(--space-lg)' }}>
            {formattedWeek}
          </p>

          <div className="time-grid">
            <div className="grid-header">Category</div>

            {weeklyTimes.map((_, i) => {
                          const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

              const currentDate = new Date(selectedWeekStart);
              currentDate.setDate(selectedWeekStart.getDate() + i);

              return (
                <div key={i} className="grid-header">
                  {weekDays[i]}<br />
                  {format(currentDate, 'MMM d')}
                </div>
              );
            })}

            <div className="grid-header">Total</div>

            {projects.map(project => {
              const projectWeekTotal = weeklyTimes.reduce((sum, dayLogs) => {
                const dayTotal = dayLogs
                  .filter(log => log.projectId === project.id)
                  .reduce((daySum, log) => daySum + (log.durationMinutes || 0), 0);
                return sum + dayTotal;
              }, 0);

              return (
                <React.Fragment key={project.id}>
                  <div className="grid-row-label">
                    <span className="category-dot" style={{ backgroundColor: project.colorHex }} />
                    <span>{project.name}</span>
                  </div>
                  {weeklyTimes.map((dayLogs, i) => {
                    const dayTotal = dayLogs
                      .filter(log => log.projectId === project.id)
                      .reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
                    const isHighlight = dayTotal > 0;
                    
                    return (
                      <div
                        key={`${project.id}-${i}`}
                        className={`grid-cell ${isHighlight ? 'grid-cell-highlight' : ''}`}
                      >
                        {dayTotal > 0 ? formatTime(dayTotal * 60) : '-'}
                      </div>
                    );
                  })}
                  <div className="grid-cell" style={{ fontWeight: 600 }}>
                    {formatTime(projectWeekTotal * 60)}
                  </div>
                </React.Fragment>
              );
            })}

            <div className="grid-row-label" style={{ fontWeight: 600 }}>Daily Total</div>
            {weeklyTimes.map((dayLogs, i) => {
              const dayTotal = dayLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
              return (
                <div
                  key={`total-${i}`}
                  className={`grid-cell ${dayTotal > 0 ? 'grid-cell-highlight' : ''}`}
                  style={{ fontWeight: 600 }}
                >
                  {dayTotal > 0 ? formatTime(dayTotal * 60) : '-'}
                </div>
              );
            })}
            <div className="grid-cell" style={{ fontWeight: 600 }}>
              {formatTime(weekTotal * 60)}
            </div>
          </div>
        </section>
      </section>
    </>
  );
}