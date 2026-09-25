import React, { useState, useEffect, useRef } from 'react';
import { Target, Clock, Calendar, CheckCircle2, ChevronRight, Plus, Trash2, PieChart } from 'lucide-react';
import * as d3 from 'd3';
import { safeLocalStorageGet, safeLocalStorageSet } from '../lib/storage';

type TaskCategory = 'Core Subjects' | 'Current Affairs' | 'PYQ Practice' | 'Optional Subject';

interface TrackedTask {
  id: string;
  title: string;
  category: TaskCategory;
  durationMinutes: number;
}

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  'Core Subjects': 'bg-blue-500',
  'Current Affairs': 'bg-emerald-500',
  'PYQ Practice': 'bg-purple-500',
  'Optional Subject': 'bg-amber-500',
};

const CATEGORY_TEXT_COLORS: Record<TaskCategory, string> = {
  'Core Subjects': 'text-blue-500',
  'Current Affairs': 'text-emerald-500',
  'PYQ Practice': 'text-purple-500',
  'Optional Subject': 'text-amber-500',
};

function D3CircularProgress({ pct }: { pct: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const size = 48;
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    
    const svg = d3.select(svgRef.current)
      .attr('width', size)
      .attr('height', size)
      .attr('viewBox', `0 0 ${size} ${size}`);
      
    svg.selectAll('*').remove();
    
    // Background circle
    svg.append('circle')
      .attr('cx', center)
      .attr('cy', center)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', 'var(--panel-border)')
      .attr('stroke-width', strokeWidth);
      
    // Progress arc
    const arcGenerator = d3.arc()
      .innerRadius(radius - strokeWidth / 2)
      .outerRadius(radius + strokeWidth / 2)
      .startAngle(0)
      .cornerRadius(strokeWidth / 2);
      
    const progressGroup = svg.append('g')
      .attr('transform', `translate(${center}, ${center})`);
      
    const clampedPct = Math.min(100, Math.max(0, pct));
    const endAngle = (clampedPct / 100) * 2 * Math.PI;
    
    progressGroup.append('path')
      .datum({ endAngle })
      .attr('d', arcGenerator as any)
      .attr('fill', pct >= 100 ? '#10b981' : 'var(--accent)')
      .attr('stroke', 'none');
      
  }, [pct]);

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
       <svg ref={svgRef} />
       <div className="absolute inset-0 flex items-center justify-center">
         {pct >= 100 ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
         ) : (
            <span className="text-[11px] font-black text-main">{pct}%</span>
         )}
       </div>
    </div>
  );
}

export function DailyGoalTracker() {
  const [goalHours, setGoalHours] = useState(() => {
    const raw = localStorage.getItem('upsc_daily_goal_hours');
    const parsed = raw ? parseInt(raw, 10) : 8;
    return isNaN(parsed) ? 8 : parsed;
  });
  
  const [trackedTasks, setTrackedTasks] = useState<TrackedTask[]>(() => 
    safeLocalStorageGet<TrackedTask[]>('upsc_daily_tracker_tasks', [])
  );

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('Core Subjects');
  const [newTaskDuration, setNewTaskDuration] = useState('60');

  useEffect(() => {
    safeLocalStorageSet('upsc_daily_tracker_tasks', trackedTasks);
  }, [trackedTasks]);

  const handleGoalChange = (delta: number) => {
    const next = Math.max(1, Math.min(16, goalHours + delta));
    setGoalHours(next);
    localStorage.setItem('upsc_daily_goal_hours', next.toString());
  };

  const addTask = () => {
    if (!newTaskTitle.trim() || isNaN(Number(newTaskDuration)) || Number(newTaskDuration) <= 0) return;
    
    const newTask: TrackedTask = {
      id: `tracker-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      durationMinutes: Number(newTaskDuration),
    };
    
    setTrackedTasks([...trackedTasks, newTask]);
    
    // Sync to deep work logs for Performance Analytics
    const existingLogs = safeLocalStorageGet<any[]>("upsc_deep_work_logs", []);
    const newLog = {
      id: newTask.id,
      date: new Date().toISOString(),
      durationMinutes: newTask.durationMinutes,
      subject: newTask.category,
      topic: newTask.title
    };
    safeLocalStorageSet("upsc_deep_work_logs", [...existingLogs, newLog]);
    window.dispatchEvent(new Event("deep_work_log_added"));
    window.dispatchEvent(new Event("app:deepWorkUpdated"));

    // Sync to deep work stats for Overview summary
    const today = new Date().toISOString().split('T')[0];
    const dwStats = safeLocalStorageGet<Record<string, number>>('upsc_deep_work_stats', {});
    dwStats[today] = (dwStats[today] || 0) + newTask.durationMinutes;
    safeLocalStorageSet('upsc_deep_work_stats', dwStats);

    setNewTaskTitle('');
    setNewTaskDuration('60');
  };

  const removeTask = (id: string) => {
    const taskToRemove = trackedTasks.find(t => t.id === id);
    if (!taskToRemove) return;

    setTrackedTasks(trackedTasks.filter(t => t.id !== id));
    
    // Remove from deep work logs
    const existingLogs = safeLocalStorageGet<any[]>("upsc_deep_work_logs", []);
    const newLogs = existingLogs.filter((l: any) => l.id !== id);
    safeLocalStorageSet("upsc_deep_work_logs", newLogs);
    window.dispatchEvent(new Event("deep_work_log_added"));
    window.dispatchEvent(new Event("app:deepWorkUpdated"));

    // Remove from deep work stats
    const today = new Date().toISOString().split('T')[0];
    const dwStats = safeLocalStorageGet<Record<string, number>>('upsc_deep_work_stats', {});
    if (dwStats[today]) {
       dwStats[today] = Math.max(0, dwStats[today] - taskToRemove.durationMinutes);
       safeLocalStorageSet('upsc_deep_work_stats', dwStats);
    }
  };

  const timePerCategory = trackedTasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + task.durationMinutes;
    return acc;
  }, {
    'Core Subjects': 0,
    'Current Affairs': 0,
    'PYQ Practice': 0,
    'Optional Subject': 0,
  } as Record<TaskCategory, number>);

  const totalMinutes = Object.values(timePerCategory).reduce((a, b) => a + b, 0);
  const totalHours = totalMinutes / 60;
  const pct = Math.min(100, Math.round((totalHours / goalHours) * 100));

  return (
    <div className="bg-app glass-panel rounded-2xl border border-panel-border p-6 relative z-10 w-full mt-6 shadow-sm group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-black text-main uppercase tracking-wider flex items-center gap-2">
          <Target className="w-5 h-5 text-accent" /> Daily Activity Tracker
        </h3>
        
        <div className="flex items-center gap-2 bg-panel border border-panel-border rounded-lg p-1">
          <span className="px-2 text-[11px] font-bold text-muted uppercase tracking-wider">Goal (Hrs)</span>
          <button 
            onClick={() => handleGoalChange(-1)} 
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-input text-muted hover:text-main transition-colors font-mono"
          >
            -
          </button>
          <span className="w-6 text-center font-mono font-bold text-[13px] text-main">{goalHours}</span>
          <button 
            onClick={() => handleGoalChange(1)} 
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-input text-muted hover:text-main transition-colors font-mono"
          >
            +
          </button>
        </div>
      </div>
      
      <div className="bg-input/20 border border-panel-border/40 p-5 rounded-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <D3CircularProgress pct={pct} />
             <div>
               <h4 className="text-[13px] font-black text-main tracking-wider uppercase">
                 Time Breakdown
               </h4>
               <p className="text-[10px] font-bold text-muted uppercase tracking-wider mt-0.5">
                 {totalHours.toFixed(1)} of {goalHours} Hrs Logged
               </p>
             </div>
          </div>
        </div>
        
        <div className="w-full h-3 bg-panel border border-panel-border/50 rounded-full overflow-hidden shadow-inner flex mb-3">
           {totalMinutes === 0 && <div className="w-full h-full bg-input/30" />}
           {Object.entries(timePerCategory).map(([category, minutes]) => {
              if (minutes === 0) return null;
              const widthPct = (minutes / (Math.max(totalMinutes, goalHours * 60))) * 100;
              return (
                <div 
                  key={category}
                  className={`h-full ${CATEGORY_COLORS[category as TaskCategory]} transition-all duration-1000 ease-out border-r border-panel-border/50 last:border-0`}
                  style={{ width: `${widthPct}%` }}
                  title={`${category}: ${(minutes/60).toFixed(1)} hrs`}
                />
              );
           })}
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mt-2">
           {(Object.keys(CATEGORY_COLORS) as TaskCategory[]).map(category => (
             <div key={category} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[category]}`} />
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  {category} ({(timePerCategory[category]/60).toFixed(1)}h)
                </span>
             </div>
           ))}
        </div>
      </div>

      <div className="space-y-4">
         <h4 className="text-[11px] font-black text-main uppercase tracking-widest flex items-center gap-1.5 border-b border-panel-border/50 pb-2">
            <PieChart className="w-3.5 h-3.5 text-accent" /> Log Activity
         </h4>
         
         <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              placeholder="Task name (e.g. Read Laxmikanth Ch 4)" 
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-input border border-panel-border rounded-lg px-3 py-2 text-sm text-main outline-none focus:border-accent"
            />
            <select
              value={newTaskCategory}
              onChange={e => setNewTaskCategory(e.target.value as TaskCategory)}
              className="bg-input border border-panel-border rounded-lg px-3 py-2 text-sm text-main outline-none focus:border-accent min-w-[140px]"
            >
               <option value="Core Subjects">Core Subjects</option>
               <option value="Current Affairs">Current Affairs</option>
               <option value="PYQ Practice">PYQ Practice</option>
               <option value="Optional Subject">Optional Subject</option>
            </select>
            <div className="flex items-center gap-2 bg-input border border-panel-border rounded-lg px-3 py-2">
               <input 
                 type="number" 
                 value={newTaskDuration}
                 onChange={e => setNewTaskDuration(e.target.value)}
                 className="w-12 bg-transparent text-sm text-main outline-none font-mono text-center"
               />
               <span className="text-[10px] font-bold text-muted uppercase">mins</span>
            </div>
            <button 
              onClick={addTask}
              disabled={!newTaskTitle.trim() || !newTaskDuration}
              className="bg-accent text-white px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Log
            </button>
         </div>

         {trackedTasks.length > 0 && (
           <div className="mt-4 space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
             {trackedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between bg-input/10 border border-panel-border/50 p-2.5 rounded-xl group hover:border-panel-border transition-colors">
                   <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-panel border border-panel-border/50 ${CATEGORY_TEXT_COLORS[task.category]}`}>
                         <CheckCircle2 className="w-4 h-4 opacity-50" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-main">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-panel border border-panel-border/50 ${CATEGORY_TEXT_COLORS[task.category]}`}>
                             {task.category}
                           </span>
                           <span className="text-[10px] text-muted font-mono">{task.durationMinutes} mins</span>
                        </div>
                      </div>
                   </div>
                   <button 
                     onClick={() => removeTask(task.id)}
                     className="p-1.5 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                     title="Remove task"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
}
