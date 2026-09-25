import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { safeLocalStorageGet } from '../lib/storage';

interface ActivityLog {
  id: string;
  date: string;
  durationMinutes: number;
  subject: string;
  topic: string;
}

export const D3CalendarHeatmap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    // Load logs from local storage
    const storedLogs = safeLocalStorageGet<ActivityLog[]>('upsc_deep_work_logs', []);
    setLogs(storedLogs);

    // Listen for custom events to update logs when a session ends
    const handleUpdate = () => {
      const updatedLogs = safeLocalStorageGet<ActivityLog[]>('upsc_deep_work_logs', []);
      setLogs(updatedLogs);
    };

    window.addEventListener('app:deepWorkUpdated', handleUpdate);
    window.addEventListener('deep_work_log_added', handleUpdate);
    return () => {
      window.removeEventListener('app:deepWorkUpdated', handleUpdate);
      window.removeEventListener('deep_work_log_added', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    // Group data by date
    const dateCounts = d3.rollup(
      logs,
      v => v.reduce((acc, log) => acc + (log.durationMinutes || 0), 0), // sum of duration
      d => {
        try {
          if (!d.date) return 'unknown';
          const dt = new Date(d.date);
          if (isNaN(dt.getTime())) return d.date.split('T')[0] || 'unknown';
          return dt.toISOString().split('T')[0];
        } catch {
          return 'unknown';
        }
      }
    );

    // Define dimensions and margins
    const width = 900;
    const cellSize = 14;
    const yearHeight = cellSize * 7 + 25;
    
    // Past year date range
    const today = new Date();
    // Go to exactly a year ago
    const timeAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    const timeDays = d3.timeDays(timeAgo, d3.timeDay.offset(today, 1));
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr("viewBox", `0 0 ${width} ${yearHeight}`)
       .attr("width", "100%")
       .attr("height", "auto")
       .attr("class", "text-main");

    const group = svg.append("g")
      .attr("transform", `translate(40, 20)`);

    // We can define a color scale
    // Define max value for color scaling (e.g. max duration in minutes or cap at 180 mins)
    const maxVal = d3.max(Array.from(dateCounts.values())) || 120;
    const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, Math.max(maxVal, 120)]);

    // Color mapper based on application aesthetic (using shades of custom accent, or standard d3)
    // Actually, let's use app colors. 
    // Lightest to darkest
    const colorPath = (val: number) => {
        if (!val || val === 0) return 'var(--panel-border)';
        // 4 breaks
        if (val < 30) return 'color-mix(in srgb, var(--accent) 30%, transparent)';
        if (val < 60) return 'color-mix(in srgb, var(--accent) 55%, transparent)';
        if (val < 120) return 'color-mix(in srgb, var(--accent) 80%, transparent)';
        return 'var(--accent)';
    }

    const monthFormat = d3.timeFormat("%b");
    const dayFormat = d3.timeFormat("%w");

    // Grouping by week
    const weekCount = (d: Date) => d3.timeWeek.count(d3.timeYear(d), d);

    // X axis - extract months
    const months = d3.timeMonths(timeAgo, d3.timeMonth.offset(today, 1));
    
    // Create an X scale based on timeWeeks from the start
    const startWeek = d3.timeSunday(timeAgo);
    const getCol = (d: Date) => d3.timeWeek.count(startWeek, d);
    
    // Calculate columns
    const columns = getCol(today) + 1;

    // Draw days (rects)
    group.selectAll("rect")
      .data(timeDays)
      .join("rect")
      .attr("width", cellSize - 2)
      .attr("height", cellSize - 2)
      .attr("x", d => getCol(d) * cellSize)
      .attr("y", d => parseInt(dayFormat(d)) * cellSize)
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("fill", d => {
        const val = dateCounts.get(d.toISOString().split('T')[0]) || 0;
        return colorPath(val);
      })
      .append("title")
      .text(d => {
        const val = dateCounts.get(d.toISOString().split('T')[0]) || 0;
        return `${d.toDateString()}: ${val} mins`;
      });

    // Add Month labels
    // We want to place the month label roughly at the week where it starts
    const monthLabels = group.selectAll(".month-label")
      .data(d3.timeMonths(timeAgo, today))
      .join("text")
      .attr("class", "month-label font-mono text-[9px] uppercase tracking-wider fill-muted")
      .attr("x", d => getCol(d) * cellSize)
      .attr("y", -6)
      .text(monthFormat);

    // Add Day labels (Mon, Wed, Fri)
    const daysArr = [1, 3, 5]; // Mon, Wed, Fri
    const dayNames = ["", "Mon", "", "Wed", "", "Fri", ""];
    group.selectAll(".day-label")
      .data(daysArr)
      .join("text")
      .attr("class", "day-label font-mono text-[9px] fill-muted")
      .attr("x", -25)
      .attr("y", d => d * cellSize + 9)
      .text(d => dayNames[d]);

  }, [logs]);

  return (
    <div className="bg-app glass-panel rounded-2xl p-6 border border-panel-border overflow-hidden">
      <div className="flex justify-between items-end mb-6 border-b border-panel-border pb-4">
        <div>
           <h3 className="text-[13px] font-black text-main uppercase tracking-widest flex items-center gap-2">
             Deep Work Consistency
           </h3>
           <p className="text-[11px] text-muted mt-1 leading-relaxed">
             Daily session frequencies visualized over the past year.
           </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted">
           <span>Less</span>
           <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: 'var(--panel-border)' }} />
           <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }} />
           <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 55%, transparent)' }} />
           <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 80%, transparent)' }} />
           <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: 'var(--accent)' }} />
           <span>More</span>
        </div>
      </div>
      
      <div className="w-full overflow-x-auto custom-scrollbar pb-2">
        <svg ref={svgRef} className="min-w-[700px]"></svg>
      </div>
    </div>
  );
};
