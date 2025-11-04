import { useEffect, useState, useRef } from 'react';
import './Tracker.css'
import type { Project, TimeLog } from '@shared/types/project.types';
import { getProjects } from '../../services/project.service';
import { isError } from '../../utils/utils';
import { getTimeLogs, createTimeLog, deleteTimelog } from '../../services/timelog.service';
import ClockLoader from '../../components/ClockLoader/ClockLoader';

export default function Tracker(){
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<Project['id']>("");
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    
    // Stopwatch state
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [pausedTime, setPausedTime] = useState(0);
    const intervalRef = useRef<number | null>(null);
    
    // Manual entry state
    const [manualHours, setManualHours] = useState(0);
    const [manualMinutes, setManualMinutes] = useState(0);
    const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

    // Load projects
    useEffect(() => {
        async function loadProjects() {
            const response = await getProjects();
            if (!isError(response)) {
                setProjects(response);
                if (response.length > 0) {
                    setSelectedProjectId(response[0].id);
                }
            } else {
                console.error(response.message);
            }
        }
        loadProjects();
    }, []);

    // Load time logs when project changes
    useEffect(() => {
        async function loadLogs() {
            if (!selectedProjectId) return;
            const response = await getTimeLogs(selectedProjectId);
            if (!isError(response)) {
                setTimeLogs(response);
            } else {
                console.error(response.message);
            }
        }
        loadLogs();
    }, [selectedProjectId]);
    
    // Stopwatch timer effect
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);
    
    // Format time for display
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    // Start/Resume stopwatch
    const handleStart = () => {
        if (!selectedProjectId) {
            alert('Please select a project first');
            return;
        }
        setIsRunning(true);
        if (!startTime) {
            // First start
            setStartTime(new Date());
        }
    };
    
    // Pause stopwatch
    const handlePause = () => {
        setIsRunning(false);
        setPausedTime(elapsedTime);
    };
    
    // Reset stopwatch
    const handleReset = () => {
        setIsRunning(false);
        setElapsedTime(0);
        setStartTime(null);
        setPausedTime(0);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };
    
    // Save stopwatch time
    const handleSave = async () => {
        if (!selectedProjectId || !startTime) {
            alert('Please select a project and start the timer first');
            return;
        }
        
        // Calculate actual end time based on elapsed time
        const endTime = new Date(startTime.getTime() + (elapsedTime * 1000));
        
        const response = await createTimeLog(selectedProjectId, {
            startTime,
            endTime,
            isManualEntry: false,
        });
        
        if (!isError(response)) {
            setTimeLogs(prev => [response, ...prev]);
            // Reset after successful save
            handleReset();
            alert('Time log saved successfully!');
        } else {
            console.error(response.message);
            alert('Failed to save time log');
        }
    };
    
    // Handle manual entry
    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedProjectId) {
            alert('Please select a project first');
            return;
        }
        
        const totalMinutes = (manualHours * 60) + manualMinutes;
        
        if (totalMinutes === 0) {
            alert('Please enter a valid duration');
            return;
        }
        
        const response = await createTimeLog(selectedProjectId, {
            durationMinutes: totalMinutes,
            isManualEntry: true,
        });
        
        if (!isError(response)) {
            setTimeLogs(prev => [response, ...prev]);
            setManualHours(0);
            setManualMinutes(0);
        } else {
            console.error(response.message);
            alert('Failed to add manual entry');
        }
    };
    
    // Delete time log
    const handleDelete = async (timeLogId: string) => {
        if (!confirm('Are you sure you want to delete this entry?')) return;
        
        const response = await deleteTimelog(timeLogId);
        
        if (!isError(response)) {
            setTimeLogs(prev => prev.filter(log => log.id !== timeLogId));
        } else {
            console.error(response.message);
            alert('Failed to delete time log');
        }
    };
    
    // Calculate today's total
    const getTodayTotal = () => {
        const today = new Date().toDateString();
        return timeLogs
            .filter(log => new Date(log.createdAt).toDateString() === today)
            .reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
    };
    
    const todayMinutes = getTodayTotal();
    const todayHours = Math.floor(todayMinutes / 60);
    const todayRemainingMinutes = todayMinutes % 60;
  
    return(
        <section className="time-tracker">
            {/* Project selector */}
            <section aria-labelledby="category-selector-title">
                <label htmlFor="global-category">Project</label>
                <select 
                    id="global-category" 
                    name="category"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                        <option key={project.id} value={project.id}>
                            {project.name}
                        </option>
                    ))}
                </select>
            </section>

            <section aria-labelledby="stopwatch-title">
                <h1 id="stopwatch-title">Stopwatch</h1>
                <p>Track time in real-time with the stopwatch</p>
                <form aria-label="Stopwatch controls" onSubmit={(e) => e.preventDefault()}>
                    <div aria-live="polite">
                        <time id="stopwatch-display">{formatTime(elapsedTime)}</time>
                    </div>

                    <button 
                        type="button" 
                        onClick={isRunning ? handlePause : handleStart}
                    >
                        {isRunning ? 'Pause' : (elapsedTime > 0 ? 'Resume' : 'Start')}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleReset}
                        disabled={elapsedTime === 0}
                    >
                        Reset
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSave}
                        disabled={elapsedTime === 0}
                    >
                        Save
                    </button>
                </form>
            </section>

            <section aria-labelledby="progress-title">
                <h1 id="progress-title">Today's Progress</h1>
                <p>Track your progress towards daily goals</p>

                <div aria-live="polite">
                    <p>
                        Total time today: {todayHours}h {todayRemainingMinutes}m
                    </p>
                    <p>
                        Total entries: {timeLogs.filter(log => 
                            new Date(log.createdAt).toDateString() === new Date().toDateString()
                        ).length}
                    </p>
                </div>
            </section>

            <section aria-labelledby="manual-entry-title">
                <h1 id="manual-entry-title">Add Manual Entry</h1>
                <p>Log time entries manually</p>

                <form aria-label="Manual time entry form" onSubmit={handleManualSubmit}>
                    <label htmlFor="manual-hours">Hours</label>
                    <input 
                        type="number" 
                        id="manual-hours" 
                        name="hours" 
                        min="0" 
                        value={manualHours}
                        onChange={(e) => setManualHours(parseInt(e.target.value) || 0)}
                    />

                    <label htmlFor="manual-minutes">Minutes</label>
                    <input 
                        type="number" 
                        id="manual-minutes" 
                        name="minutes" 
                        min="0" 
                        value={manualMinutes}
                        onChange={(e) => setManualMinutes(parseInt(e.target.value) || 0)}
                    />

                    <label htmlFor="manual-date">Date</label>
                    <input 
                        type="date" 
                        id="manual-date" 
                        name="date"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                    />

                    <button type="submit">Add Entry</button>
                </form>
            </section>

            <section aria-labelledby="recent-entries-title">
                <h1 id="recent-entries-title">Recent Entries</h1>
                <p>Your latest time entries</p>

                { selectedProjectId && timeLogs === null ? (
                    <ClockLoader /> 
                ) :timeLogs.length === 0 ? (
                    <p>No entries yet. Start tracking time!</p>
                ) : (
                    <ul>
                        {timeLogs.slice(0, 10).map((log) => {
                            const hours = Math.floor(log.durationMinutes / 60);
                            const minutes = log.durationMinutes % 60;
                            const project = projects.find(p => p.id === log.projectId);
                            
                            return (
                                <li key={log.id}>
                                    <article style={{ "--dot-color": project?.colorHex } as React.CSSProperties}>
                                        <h2>{project?.name || 'Unknown Project'}</h2>
                                        <time dateTime={new Date(log.createdAt).toISOString()}>
                                            {new Date(log.createdAt).toLocaleDateString()}
                                        </time>
                                        <p>
                                            {hours > 0 
                                            ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}` 
                                            : `${minutes}m`}
                                            {!(log.startTime && log.endTime) && ' (Manual)'}
                                        </p>
                                        <button 
                                            type="button" 
                                            aria-label="Delete entry"
                                            onClick={() => handleDelete(log.id)}
                                        >
                                            🗑️
                                        </button>
                                    </article>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </section>
    )
}