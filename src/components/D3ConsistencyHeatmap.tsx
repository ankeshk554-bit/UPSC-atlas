import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";

interface DeepWorkLog {
  id: string;
  date: string;
  durationMinutes: number;
  subject: string;
  topic: string;
}

interface D3ConsistencyHeatmapProps {
  logs: DeepWorkLog[];
}

export function D3ConsistencyHeatmap({ logs }: D3ConsistencyHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ date: string; mins: number } | null>(null);

  // Define date range: last 6 months (roughly)
  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - 5);
    startDate.setDate(1); // align to start of month
    startDate.setHours(0,0,0,0);
    return { startDate, endDate: today };
  }, []);

  // Map dates to durations
  const dateMinsMap = useMemo(() => {
    const map = new Map<string, number>();
    logs.forEach((log) => {
      if (log.date) {
        const dateStr = log.date.split("T")[0];
        const prev = map.get(dateStr) || 0;
        map.set(dateStr, prev + log.durationMinutes);
      }
    });
    return map;
  }, [logs]);

  // Redraw heatmap
  useEffect(() => {
    if (!svgRef.current) return;

    const { startDate, endDate } = dateRange;
    const timeDays = d3.timeDays(startDate, d3.timeDay.offset(endDate, 1));

    // Simple dimensions
    const cellSize = 14;
    const cellGap = 3.5;
    const topMargin = 22;
    const leftMargin = 30;

    // Helper: Find columns
    const startSunday = d3.timeSunday(startDate);
    const getColIndex = (d: Date) => d3.timeWeek.count(startSunday, d);
    const getRowIndex = (d: Date) => d.getDay(); // Sunday is 0, Saturday is 6

    const maxCols = getColIndex(endDate) + 1;
    const width = leftMargin + maxCols * (cellSize + cellGap) + 15;
    const height = topMargin + 7 * (cellSize + cellGap) + 15;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", "100%")
      .attr("height", "auto")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-height: 180px; overflow: visible; font-family: sans-serif;");

    const group = svg.append("g").attr("transform", `translate(${leftMargin}, ${topMargin})`);

    // Define colors mapper based on study time
    // Empty, Cozy, Normal, Diligent, Intense
    const getColor = (mins: number) => {
      const isDark = d3.select("html").classed("dark");
      if (mins === 0) {
        return isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
      }
      if (mins < 30) return "color-mix(in srgb, var(--accent) 25%, transparent)";
      if (mins < 60) return "color-mix(in srgb, var(--accent) 50%, transparent)";
      if (mins < 120) return "color-mix(in srgb, var(--accent) 75%, transparent)";
      return "var(--accent)"; // Full accent for intense deep work
    };

    // Tooltip
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .attr(
        "class",
        "absolute bg-panel border border-panel-border px-3 py-2 rounded-xl shadow-xl pointer-events-none text-[11px] text-main font-semibold leading-tight hidden z-50 transition-all font-sans"
      )
      .style("transform", "translate(-50%, -105%)");

    // Drawing cells (rects) with staggered transition
    const cells = group
      .selectAll(".day-cell")
      .data(timeDays)
      .join("g")
      .attr("class", "day-cell")
      .attr("transform", (d) => {
        const x = getColIndex(d) * (cellSize + cellGap);
        const y = getRowIndex(d) * (cellSize + cellGap);
        return `translate(${x}, ${y})`;
      });

    // Append visual square inside each cell group
    cells
      .append("rect")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("rx", 3.2)
      .attr("ry", 3.2)
      .attr("fill", (d) => {
        const dateStr = d.toISOString().split("T")[0];
        const mins = dateMinsMap.get(dateStr) || 0;
        return getColor(mins);
      })
      .attr("class", "cursor-pointer transition-colors duration-150")
      // Animated scale expansion
      .attr("transform", "scale(0)")
      .transition()
      .duration(450)
      .delay((d, i) => Math.min(650, getColIndex(d) * 12 + getRowIndex(d) * 5))
      .ease(d3.easeCubicOut)
      .attr("transform", "scale(1)");

    // Mouse interactive capture
    cells
      .on("pointerenter", (event, d) => {
        const dateStr = d.toISOString().split("T")[0];
        const mins = dateMinsMap.get(dateStr) || 0;
        const x = getColIndex(d) * (cellSize + cellGap) + cellSize / 2 + leftMargin;
        const y = getRowIndex(d) * (cellSize + cellGap) + topMargin;

        const dateFormatted = d.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        // Highlight square border locally
        d3.select(event.currentTarget).select("rect")
          .attr("stroke", "var(--color-accent, #4f46e5)")
          .attr("stroke-width", 1.5);

        tooltip
          .style("left", `${x}px`)
          .style("top", `${y}px`)
          .style("display", "block")
          .classed("hidden", false)
          .html(`
            <div class="space-y-1">
              <div class="text-[10px] text-muted font-bold">${dateFormatted}</div>
              <div class="text-[12px] font-black flex items-center gap-1.5 text-main">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${getColor(mins)}"></span>
                <span>${mins > 0 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : "No activity"} logged</span>
              </div>
            </div>
          `);
      })
      .on("pointerleave", (event, d) => {
        // Reset cell visual state
        d3.select(event.currentTarget).select("rect")
          .attr("stroke", "none");

        tooltip.style("display", "none").classed("hidden", true);
      });

    // Add Month labels
    const months = d3.timeMonths(startDate, d3.timeMonth.offset(endDate, 1));
    group
      .selectAll(".month-label")
      .data(months)
      .join("text")
      .attr("class", "month-label text-[10px] uppercase tracking-wider fill-muted/70 font-sans font-bold")
      .attr("x", (d) => getColIndex(d) * (cellSize + cellGap))
      .attr("y", -6)
      .text(d3.timeFormat("%b"));

    // Add Weekday labels
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    // Render only standard study intervals to keep it neat side margin (Mon, Wed, Fri)
    const activeDays = [1, 3, 5];
    group
      .selectAll(".weekday-label")
      .data(activeDays)
      .join("text")
      .attr("class", "weekday-label text-[9px] fill-muted/65 font-mono font-bold")
      .attr("x", -leftMargin + 3)
      .attr("y", (d) => d * (cellSize + cellGap) + cellSize - 3)
      .text((d) => weekdays[d]);

    return () => {
      tooltip.remove();
    };
  }, [logs, dateMinsMap, dateRange]);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-auto pb-4 pt-1">
      <div className="min-w-[700px] px-1">
        <svg ref={svgRef} className="w-full h-full overflow-visible" />
      </div>
    </div>
  );
}
