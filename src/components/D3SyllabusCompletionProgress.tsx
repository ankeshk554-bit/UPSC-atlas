import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface SyllabusProgressPoint {
  date: string;
  mastered: number;
  inProgress: number;
  notStarted: number;
}

interface D3SyllabusCompletionProgressProps {
  data: SyllabusProgressPoint[];
}

export function D3SyllabusCompletionProgress({ data }: D3SyllabusCompletionProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });

  // Respond to resize
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      setDimensions({
        width: Math.max(300, width),
        height: 350,
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Compute and Draw Chart
  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const { width, height } = dimensions;
    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3
      .scalePoint()
      .domain(data.map((d) => d.date))
      .range([0, chartWidth])
      .padding(0.4);

    // Find max value in either mastered or total
    const maxVal = d3.max(data, (d) => Math.max(d.mastered + d.inProgress, 10)) || 100;
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.ceil(maxVal * 1.15)]) // Extra padding
      .range([chartHeight, 0]);

    // Grid lines - Horizontal only
    chartGroup
      .append("g")
      .attr("class", "grid-lines opacity-10")
      .selectAll("line")
      .data(yScale.ticks(5))
      .join("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "var(--color-main, #000)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");

    // Gradients
    const defs = svg.append("defs");

    // Mastered gradient (green/emerald)
    const masteredGradient = defs
      .append("linearGradient")
      .attr("id", "mastered-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    masteredGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", d3.select("html").classed("dark") ? 0.45 : 0.25);
    masteredGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0);

    // In Progress gradient (amber/orange)
    const progressGradient = defs
      .append("linearGradient")
      .attr("id", "inprogress-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    progressGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#f59e0b")
      .attr("stop-opacity", d3.select("html").classed("dark") ? 0.35 : 0.18);
    progressGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#f59e0b")
      .attr("stop-opacity", 0);

    // Clip paths for animating the entrance from left to right
    const clipId = `clip-syllabus-${Math.round(Math.random() * 100000)}`;
    defs
      .append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", chartHeight)
      .attr("width", 0) // Start at zero for animation
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr("width", chartWidth);

    // Area & Line Generator: Mastered
    const masteredArea = d3
      .area<SyllabusProgressPoint>()
      .x((d) => xScale(d.date) || 0)
      .y0(chartHeight)
      .y1((d) => yScale(d.mastered))
      .curve(d3.curveMonotoneX);

    const masteredLine = d3
      .line<SyllabusProgressPoint>()
      .x((d) => xScale(d.date) || 0)
      .y((d) => yScale(d.mastered))
      .curve(d3.curveMonotoneX);

    // Area & Line Generator: Cumulative (Mastered + In Progress)
    const cumulativeArea = d3
      .area<SyllabusProgressPoint>()
      .x((d) => xScale(d.date) || 0)
      .y0(chartHeight)
      .y1((d) => yScale(d.mastered + d.inProgress))
      .curve(d3.curveMonotoneX);

    const cumulativeLine = d3
      .line<SyllabusProgressPoint>()
      .x((d) => xScale(d.date) || 0)
      .y((d) => yScale(d.mastered + d.inProgress))
      .curve(d3.curveMonotoneX);

    // Draw Cumulative (Mastered + In Progress) first to lay behind
    chartGroup
      .append("path")
      .datum(data)
      .attr("class", "cumulative-area")
      .attr("d", cumulativeArea)
      .attr("fill", "url(#inprogress-grad)")
      .attr("clip-path", `url(#${clipId})`);

    chartGroup
      .append("path")
      .datum(data)
      .attr("class", "cumulative-line")
      .attr("d", cumulativeLine)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2.5)
      .attr("clip-path", `url(#${clipId})`);

    // Draw Mastered on top
    chartGroup
      .append("path")
      .datum(data)
      .attr("class", "mastered-area")
      .attr("d", masteredArea)
      .attr("fill", "url(#mastered-grad)")
      .attr("clip-path", `url(#${clipId})`);

    chartGroup
      .append("path")
      .datum(data)
      .attr("class", "mastered-line")
      .attr("d", masteredLine)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 3)
      .attr("clip-path", `url(#${clipId})`);

    // X Axis
    const xAxisGroup = chartGroup
      .append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0));
    xAxisGroup.select(".domain").attr("stroke", "rgba(var(--color-panel-border), 0.15)");
    xAxisGroup
      .selectAll("text")
      .attr("class", "font-sans-fallback text-[11px] font-bold fill-muted")
      .attr("dy", 12);

    // Y Axis
    const yAxisGroup = chartGroup.append("g").call(
      d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => `${d}`)
        .tickSizeOuter(0)
        .tickSize(-5)
    );
    yAxisGroup.select(".domain").remove();
    yAxisGroup
      .selectAll("text")
      .attr("class", "font-mono text-[10px] font-semibold fill-muted")
      .attr("dx", -8);

    // Interactive Hover Layer
    const hoverLine = chartGroup
      .append("line")
      .attr("stroke", "currentColor")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4")
      .attr("class", "text-muted/30")
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .style("opacity", 0);

    const masteredDot = chartGroup
      .append("circle")
      .attr("r", 5)
      .attr("fill", "#10b981")
      .attr("stroke", "var(--color-panel, #fff)")
      .attr("stroke-width", 1.5)
      .style("opacity", 0);

    const inProgressDot = chartGroup
      .append("circle")
      .attr("r", 5)
      .attr("fill", "#f59e0b")
      .attr("stroke", "var(--color-panel, #fff)")
      .attr("stroke-width", 1.5)
      .style("opacity", 0);

    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .attr(
        "class",
        "absolute bg-panel border border-panel-border px-4 py-3 rounded-2xl shadow-xl pointer-events-none text-[11px] font-sans font-bold leading-relaxed transition-all hidden z-50 text-main font-semibold"
      )
      .style("transform", "translate(-50%, -100%)");

    // Pointer overlay target to catch interactive logic
    chartGroup
      .append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("pointerenter", () => {
        hoverLine.style("opacity", 1);
        masteredDot.style("opacity", 1);
        inProgressDot.style("opacity", 1);
        tooltip.style("display", "block").classed("hidden", false);
      })
      .on("pointermove", (event) => {
        const [mx] = d3.pointer(event);
        // Find nearest point
        const domain = xScale.domain();
        const range = domain.map((d) => xScale(d) || 0);
        const index = d3.bisectCenter(range, mx);
        const d = data[index];

        if (d) {
          const xPos = xScale(d.date) || 0;
          hoverLine.attr("x1", xPos).attr("x2", xPos);

          masteredDot.attr("cx", xPos).attr("cy", yScale(d.mastered));
          inProgressDot.attr("cx", xPos).attr("cy", yScale(d.mastered + d.inProgress));

          // Tooltip content & positioning
          tooltip
            .style("left", `${xPos + margin.left}px`)
            .style("top", `${yScale(d.mastered + d.inProgress) + margin.top - 12}px`)
            .html(`
              <div class="space-y-1">
                <div class="text-[10px] uppercase text-muted tracking-wide font-black">${d.date}</div>
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Mastered: <span class="font-black text-main">${d.mastered}</span> topics</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>In Progress: <span class="font-black text-main">${d.inProgress}</span> topics</span>
                </div>
                <div class="flex items-center gap-2 pt-0.5 border-t border-panel-border/40 text-[10px] text-muted">
                  <span>Total Active Coverage: <span class="font-bold text-main">${d.mastered + d.inProgress}</span></span>
                </div>
              </div>
            `);
        }
      })
      .on("pointerleave", () => {
        hoverLine.style("opacity", 0);
        masteredDot.style("opacity", 0);
        inProgressDot.style("opacity", 0);
        tooltip.style("display", "none").classed("hidden", true);
      });

    return () => {
      tooltip.remove();
    };
  }, [data, dimensions]);

  return (
    <div ref={containerRef} className="relative w-full h-[350px]">
      <svg ref={svgRef} className="w-full h-full overflow-visible" />
    </div>
  );
}
