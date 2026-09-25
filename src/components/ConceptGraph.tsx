import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { 
  Network, 
  FileText, 
  RefreshCw, 
  Search, 
  Clock, 
  ArrowRight,
  Maximize2,
  Minimize2,
  CheckCircle2,
  BookOpen,
  Filter,
  Check,
  Compass,
  AlertCircle
} from 'lucide-react';
import { ViewType } from '../types';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  radius: number;
  status?: string;
  summary?: string;
  flashcards?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
}

interface ConceptGraphProps {
  onNavigate?: (view: ViewType) => void;
}

export function ConceptGraph({ onNavigate }: ConceptGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<any>(null);
  const zoomBehaviorRef = useRef<any>(null);
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layoutEngine, setLayoutEngine] = useState<'force' | 'tree'>('force');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  const [subjectFilter, setSubjectFilter] = useState<'all' | number>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'mastered' | 'reading' | 'not_started'>('all');

  // Load Graph Data
  const loadGraphData = useCallback(() => {
    try {
      const saved = localStorage.getItem('upsc_syllabus_v2');
      let generateGeneric = true;
      let generatedNodes: Node[] = [];
      let generatedLinks: Link[] = [];

      // Helper function to resolve exact GS Group / Paper Category dynamically and robustly
      const getGSGroup = (node: any, parentNode: any): number => {
        const idStr = (node.id || "").toLowerCase();
        const titleStr = (node.title || node.topic || "").toLowerCase();
        
        const parentIdStr = parentNode ? (parentNode.id || "").toLowerCase() : "";
        const parentTitleStr = parentNode ? (parentNode.title || parentNode.topic || "").toLowerCase() : "";

        // A. Direct exact overrides for specific UPSC GS Codes
        if (idStr.startsWith("gs1") || idStr.includes("gs-1") || idStr.includes("gs_1") || idStr.startsWith("mains-gs1")) return 1;
        if (idStr.startsWith("gs2") || idStr.includes("gs-2") || idStr.includes("gs_2") || idStr.startsWith("mains-gs2")) return 2;
        if (idStr.startsWith("gs3") || idStr.includes("gs-3") || idStr.includes("gs_3") || idStr.startsWith("mains-gs3")) return 3;
        if (idStr.startsWith("gs4") || idStr.includes("gs-4") || idStr.includes("gs_4") || idStr.startsWith("mains-gs4")) return 4;
        
        // Prelims specifics overriding generalities
        if (idStr === "pre-p1-2") return 1; // History of India -> GS I
        if (idStr === "pre-p1-3") return 1; // India and World Geography -> GS I
        if (idStr === "pre-p1-4") return 2; // Polity & Constitution -> GS II
        if (idStr === "pre-p1-5") return 3; // Economy & Development -> GS III
        if (idStr === "pre-p1-6") return 3; // Environment & Climate -> GS III
        if (idStr === "pre-p1-7") return 3; // General Science -> GS III

        // B. Inherit group index from parent if parent exists and is classified under a paper
        // This is extremely key for things like Law subtopics (Fundamental Rights) so they stay under Law / Optionals (6)
        if (parentNode) {
          // Resolve parent group
          const parentGroup = getGSGroup(parentNode, null);
          // If parent is already specific (GS I-IV, Prelims, Law Optionals), return it!
          if (parentGroup >= 1 && parentGroup <= 6) {
             return parentGroup;
          }
        }

        // C. Specific ID prefixes
        if (idStr.startsWith("essay") || idStr.includes("mains-essay")) return 6;
        if (idStr.startsWith("law-p") || idStr.startsWith("const-") || idStr.includes("law")) return 6;
        if (idStr.startsWith("pre-p2") || idStr === "pre-p2") return 5;
        if (idStr.startsWith("pre-p1") || idStr === "pre-p1" || idStr === "prelims") return 5;

        // D. Let parent titles or parent ID substring guide if matches exist
        if (parentIdStr.includes("gs1") || parentIdStr.includes("gs-1") || parentTitleStr.includes("studies-i") || parentTitleStr.includes("general studies i") || parentTitleStr.includes("general studies-i")) return 1;
        if (parentIdStr.includes("gs2") || parentIdStr.includes("gs-2") || parentTitleStr.includes("studies-ii") || parentTitleStr.includes("general studies ii") || parentTitleStr.includes("general studies-ii")) return 2;
        if (parentIdStr.includes("gs3") || parentIdStr.includes("gs-3") || parentTitleStr.includes("studies-iii") || parentTitleStr.includes("general studies iii") || parentTitleStr.includes("general studies-iii")) return 3;
        if (parentIdStr.includes("gs4") || parentIdStr.includes("gs-4") || parentTitleStr.includes("studies-iv") || parentTitleStr.includes("general studies iv") || parentTitleStr.includes("general studies-iv")) return 4;
        if (parentIdStr.includes("law") || parentIdStr.includes("essay") || parentTitleStr.includes("optional") || parentTitleStr.includes("law")) return 6;

        // E. Keyword fallback only if no parent exists or parent wasn't mapped
        const matchKeywords = (keywords: string[]) => keywords.some(kw => titleStr.includes(kw));

        if (matchKeywords(["history", "geography", "society", "art and culture", "heritage", "globalization", "secularism", "communalism", "urbanization"])) return 1;
        if (matchKeywords(["polity", "constitution", "governance", "parliament", "legislature", "executive", "judiciary", "ngo", "welfare", "international relations", "social justice", "unions", "representation of people"])) return 2;
        if (matchKeywords(["economy", "economic", "budget", "crops", "subsidies", "food processing", "land reforms", "infrastructure", "liberalization", "investment", "technology", "space", "robotics", "it", "cyber", "extremism", "terrorism", "security", "disaster", "environment", "pollution"])) return 3;
        if (matchKeywords(["ethics", "integrity", "aptitude", "probity", "moral", "citizen", "charter", "rti", "conduct", "case studies", "foundational values"])) return 4;
        if (matchKeywords(["csat", "comprehension", "reasoning", "analytical", "mental ability", "numeracy", "data interpretation"])) return 5;
        if (matchKeywords(["optional", "law", "essay"])) return 6;

        return 1; // Default
      };

      if (saved) {
        const topics = JSON.parse(saved);
        if (topics && topics.length > 0) {
          generateGeneric = false;
          let idCounter = 1;

          // Helper to recursively parse topics and subtopics into a graph with depth
          const processTopic = (node: any, parentNode: any, depth: number) => {
            const currentId = node.topic || node.title || `topic_${idCounter++}`;
            const groupIndex = getGSGroup(node, parentNode);
            
            // Map depth to radius
            let nodeRadius = 6;
            if (depth === 0) nodeRadius = 18;
            else if (depth === 1) nodeRadius = 11;
            else nodeRadius = 6.5;

            // Only add node if it doesn't exist
            if (!generatedNodes.find(n => n.id === currentId)) {
              generatedNodes.push({
                id: currentId,
                group: groupIndex,
                radius: nodeRadius,
                status: node.status || 'not_started',
                summary: node.summary || node.description || `Syllabus core topic: explore key points and subtopics in your research notes.`,
                flashcards: Math.floor(Math.random() * 15) + 3
              });
            }

            if (parentNode) {
              const parentIdVal = parentNode.topic || parentNode.title;
              if (parentIdVal) {
                generatedLinks.push({
                  source: parentIdVal,
                  target: currentId,
                  value: depth === 1 ? 2.5 : depth === 2 ? 1.5 : 1
                });
              }
            }

            if (node.subtopics && Array.isArray(node.subtopics)) {
              node.subtopics.forEach((sub: any) => {
                processTopic(sub, node, depth + 1);
              });
            }
          };

          // Process premium dynamic items
          topics.forEach((t: any) => {
            processTopic(t, null, 0);
          });
          
          // Add cross-links for a beautiful interconnected network
          if (generatedNodes.length > 5) {
             for (let i = 0; i < Math.min(12, generatedNodes.length / 3); i++) {
                const source = generatedNodes[Math.floor(Math.random() * generatedNodes.length)].id;
                const target = generatedNodes[Math.floor(Math.random() * generatedNodes.length)].id;
                if (source !== target && !generatedLinks.find(l => (l.source === source && l.target === target) || (l.source === target && l.target === source))) {
                  generatedLinks.push({ source, target, value: 0.5 });
                }
             }
          }
        }
      }

      if (generateGeneric) {
        // Fallback polished data
        generatedNodes = [
          { id: "GS I", group: 1, radius: 18, status: "reading", summary: "Indian Heritage and Culture, History and Geography of the World and Society.", flashcards: 42 },
          { id: "History", group: 1, radius: 11, status: "mastered", summary: "Modern Indian history from about the middle of the eighteenth century until the present- significant events, personalities, issues.", flashcards: 15 },
          { id: "Geography", group: 1, radius: 11, status: "not_started", summary: "Salient features of world's physical geography.", flashcards: 8 },
          { id: "GS II", group: 2, radius: 18, status: "reading", summary: "Governance, Constitution, Polity, Social Justice and International relations.", flashcards: 30 },
          { id: "Polity", group: 2, radius: 11, status: "reading", summary: "Indian Constitution- historical underpinnings, evolution, features, amendments, significant provisions and basic structure.", flashcards: 22 },
          { id: "Constitution", group: 2, radius: 7, status: "mastered", summary: "Functions and responsibilities of the Union and the States.", flashcards: 10 },
          { id: "IR", group: 2, radius: 11, status: "not_started", summary: "India and its neighborhood- relations.", flashcards: 5 },
          { id: "GS III", group: 3, radius: 18, status: "not_started", summary: "Technology, Economic Development, Bio diversity, Environment, Security and Disaster Management", flashcards: 38 },
          { id: "Economy", group: 3, radius: 11, status: "reading", summary: "Indian Economy and issues relating to planning, mobilization, of resources, growth, development and employment.", flashcards: 18 },
          { id: "Environment", group: 3, radius: 11, status: "not_started", summary: "Conservation, environmental pollution and degradation, environmental impact assessment.", flashcards: 12 },
          { id: "GS IV", group: 4, radius: 18, status: "mastered", summary: "Ethics, Integrity and Aptitude", flashcards: 25 },
          { id: "Ethics", group: 4, radius: 11, status: "mastered", summary: "Ethics and Human Interface: Essence, determinants and consequences of Ethics in-human actions.", flashcards: 20 },
        ];
        generatedLinks = [
          { source: "GS I", target: "History", value: 2.5 },
          { source: "GS I", target: "Geography", value: 2.5 },
          { source: "GS II", target: "Polity", value: 2.5 },
          { source: "Polity", target: "Constitution", value: 1.5 },
          { source: "GS II", target: "IR", value: 2.5 },
          { source: "GS III", target: "Economy", value: 2.5 },
          { source: "GS III", target: "Environment", value: 2.5 },
          { source: "GS IV", target: "Ethics", value: 2.5 },
          // Interconnections
          { source: "Geography", target: "Environment", value: 1 },
          { source: "Polity", target: "History", value: 0.5 },
          { source: "Economy", target: "IR", value: 1 },
          { source: "Ethics", target: "Polity", value: 0.8 },
        ];
      }

      setNodes(generatedNodes);
      setLinks(generatedLinks);

    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  // Handle Event for Syllabus Changes elsewhere
  useEffect(() => {
    const handleSync = () => {
      loadGraphData();
    };
    window.addEventListener('app:syllabusUpdated', handleSync);
    return () => window.removeEventListener('app:syllabusUpdated', handleSync);
  }, [loadGraphData]);

  // Compute stats on active nodes
  const totalCount = nodes.length;
  const masteredCount = nodes.filter(n => n.status === 'mastered').length;
  const readingCount = nodes.filter(n => n.status === 'reading' || n.status === 'learning').length;
  const pendingCount = totalCount - masteredCount - readingCount;

  // Selected Node Details
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  // Find Neighbors
  const getNeighbors = useCallback((nodeId: string): string[] => {
    const neighbors: string[] = [];
    links.forEach(l => {
      const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      if (srcId === nodeId && tgtId !== nodeId) {
        neighbors.push(tgtId);
      } else if (tgtId === nodeId && srcId !== nodeId) {
        neighbors.push(srcId);
      }
    });
    return Array.from(new Set(neighbors));
  }, [links]);

  const selectedNodeNeighbors = selectedNode ? getNeighbors(selectedNode.id) : [];

  // Update syllabus status from graph editor
  const handleUpdateStatus = (nodeId: string, newStatus: 'not_started' | 'reading' | 'mastered') => {
    try {
      const saved = localStorage.getItem('upsc_syllabus_v2');
      if (!saved) return;
      const topics = JSON.parse(saved);
      
      let updated = false;
      const updateRecursive = (list: any[]) => {
        for (const item of list) {
          if (item.id === nodeId || item.title === nodeId) {
            item.status = newStatus;
            updated = true;
            break;
          }
          if (item.subtopics && Array.isArray(item.subtopics)) {
            updateRecursive(item.subtopics);
            if (updated) break;
          }
        }
      };
      
      updateRecursive(topics);
      if (updated) {
        localStorage.setItem('upsc_syllabus_v2', JSON.stringify(topics));
        window.dispatchEvent(new CustomEvent("app:syllabusUpdated"));
        // Update local state smoothly
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: newStatus } : n));
      }
    } catch (err) {
      console.error("Error updating syllabus status:", err);
    }
  };

  // Center & zoom onto a specific node ID
  const zoomToNodeId = useCallback((nodeId: string) => {
    if (!containerRef.current || !svgRef.current || !zoomBehaviorRef.current) return;
    
    const svg = svgRef.current;
    const zoom = zoomBehaviorRef.current;
    
    const width = containerRef.current.clientWidth;
    const height = isFullscreen ? window.innerHeight * 0.75 : 440;

    const circles = svg.selectAll('circle');
    let targetNode: any = null;
    circles.each(function(d: any) {
      if (d && d.id === nodeId) {
        targetNode = d;
      }
    });

    if (targetNode) {
      const scale = 1.6;
      const targetTransform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-targetNode.x, -targetNode.y);

      svg.transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .call(zoom.transform as any, targetTransform);
        
      setSelectedNodeId(nodeId);
    }
  }, [isFullscreen]);

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    svgRef.current.transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    setSelectedNodeId(null);
  };

  // Filter out nodes based on UI controls (Subjects or status filters)
  const isNodeVisibleByFilters = useCallback((n: Node) => {
    // Keep root index parent categories (Preliminary Exam, Mains Exam, Optionals) always visible to maintain structural layout integrity!
    if (n.radius > 15) {
      return true;
    }
    if (subjectFilter !== 'all' && n.group !== subjectFilter) {
      return false;
    }
    if (statusFilter !== 'all') {
      const isMastered = n.status === 'mastered';
      const isReading = n.status === 'reading' || n.status === 'learning';
      const isNotStarted = !isMastered && !isReading;
      
      if (statusFilter === 'mastered' && !isMastered) return false;
      if (statusFilter === 'reading' && !isReading) return false;
      if (statusFilter === 'not_started' && !isNotStarted) return false;
    }
    return true;
  }, [subjectFilter, statusFilter]);

  // Main Render D3 Visualizer
  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    let width = containerRef.current.clientWidth || 800;
    let height = containerRef.current.clientHeight || (isFullscreen ? window.innerHeight * 0.75 : 440);

    // Clear previous SVG
    d3.select(containerRef.current).selectAll('svg').remove();
    d3.select(containerRef.current).selectAll('.tooltip-d3').remove();

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height])
      .attr('class', 'select-none outline-none');

    svgRef.current = svg;

    const mainContainer = svg.append('g');

    // Zoom setup
    const zoom = d3.zoom()
        .scaleExtent([0.15, 6])
        .on('zoom', (event) => {
            mainContainer.attr('transform', event.transform);
        });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom as any);

    // Color schema based on group
    const color = d3.scaleOrdinal<any, any>()
      .domain([1, 2, 3, 4, 5, 6, 7])
      .range(['#38bdf8', '#818cf8', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#fb7185']);

    // Deep copy data since simulation modifies it in-place
    const simulationNodes = nodes.map(d => Object.create(d));
    const simulationLinks = links.map(d => Object.create(d));

    // Calculate cluster centers for a force-directed layout that groups related nodes
    const uniqueGroups = Array.from(new Set(simulationNodes.map(n => n.group)));
    const groupCenters: Record<number, {x: number, y: number}> = {};
    const clusterRadius = Math.min(width, height) * 0.32;
    uniqueGroups.forEach((g, i) => {
       const angle = (i / uniqueGroups.length) * 2 * Math.PI - Math.PI / 2;
       groupCenters[Number(g)] = {
          x: width / 2 + clusterRadius * Math.cos(angle),
          y: height / 2 + clusterRadius * Math.sin(angle)
       };
    });

    const simulation = d3.forceSimulation(simulationNodes)
      .force('link', d3.forceLink(simulationLinks).id((d: any) => d.id).distance(layoutEngine === 'force' ? 95 : 55))
      .force('charge', d3.forceManyBody().strength(layoutEngine === 'force' ? -300 : -150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => d.radius + (layoutEngine === 'force' ? 14 : 9)).iterations(3));
      
    // Apply specialized directional layouts
    if (layoutEngine === 'force') {
      simulation
        .force('x', d3.forceX().strength(0.12).x((d: any) => groupCenters[d.group]?.x || width / 2))
        .force('y', d3.forceY().strength(0.12).y((d: any) => groupCenters[d.group]?.y || height / 2));
    } else {
      simulation
        .force('y', d3.forceY().strength(0.7).y((d: any) => {
            if (d.radius >= 17) return height * 0.2;
            if (d.radius >= 11) return height * 0.45;
            return height * 0.75;
        }))
        .force('x', d3.forceX().strength(0.12).x((d: any) => {
          // Sort horizontally by group to keep subjects clean
          const groupIndex = uniqueGroups.indexOf(d.group);
          return width * 0.15 + (width * 0.7 * (groupIndex / Math.max(1, uniqueGroups.length - 1)));
        }));
    }

    // SVG Gradient for glowing halos
    const defs = svg.append('defs');
    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const merge = glowFilter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'coloredBlur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // RENDER CONNECTIONS
    const linkContainer = mainContainer.append('g')
      .attr('stroke', '#334155')
      .attr('stroke-opacity', 0.55);
    
    const link = linkContainer
      .selectAll('line')
      .data(simulationLinks)
      .join('line')
      .attr('stroke-dasharray', (d: any) => d.value < 1 ? '4 4' : 'none')
      .attr('stroke-width', (d: any) => Math.sqrt(d.value) * 1.5);

    // RENDER NODES
    const nodeContainer = mainContainer.append('g')
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');

    const node = nodeContainer
      .selectAll('circle')
      .data(simulationNodes)
      .join('circle')
      .attr('r', (d: any) => d.radius)
      .attr('fill', (d: any) => {
         if (d.status === 'mastered') return '#10b981'; // Emerald
         if (d.status === 'reading' || d.status === 'learning') return '#fbbf24'; // Warning Yellow
         return d.radius > 15 ? (color(d.group) as string) : '#64748b'; // Slate for unstarted subtopics
      })
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .call(drag(simulation) as any);

    // Node Interactive Events
    node.on('click', (event, d: any) => {
      event.stopPropagation();
      setSelectedNodeId(d.id);
      
      // Smooth travel zoom/center
      const targetTransform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(1.5)
        .translate(-d.x, -d.y);
      
      svg.transition()
        .duration(850)
        .ease(d3.easeCubicOut)
        .call(zoom.transform as any, targetTransform);
    });

    // Outer click resets
    svg.on('click', () => {
      setSelectedNodeId(null);
    });

    // RENDER TEXT LABELS
    const labelContainer = mainContainer.append('g')
        .attr('class', 'labels')
        .selectAll('text')
        .data(simulationNodes)
        .join('text')
        .attr('dy', 4)
        .attr('dx', (d: any) => d.radius + 6)
        .text((d: any) => {
           // Render actual label values from inception so they are physically present inside SVGs
           return d.id.length > 28 ? d.id.substring(0, 28) + '...' : d.id;
        })
        .attr('font-size', (d: any) => d.radius > 15 ? '12px' : '10px')
        .attr('font-weight', (d: any) => d.radius > 15 ? '700' : '500')
        .attr('fill', '#f1f5f9')
        .attr('paint-order', 'stroke')
        .attr('stroke', '#090d16')
        .attr('stroke-width', '3px')
        .attr('pointer-events', 'none');

    // Drag constraints
    function drag(sim: d3.Simulation<Node, undefined>) {
      function dragstarted(event: any, d: any) {
        if (!event.active) sim.alphaTarget(0.2).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: any, d: any) {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    // Simulation Loop updates
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
        
      labelContainer
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    const resizeObserver = new ResizeObserver(entries => {
      if (!entries.length) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      if (newWidth === 0 || newHeight === 0) return;
      
      svg.attr('viewBox', [0, 0, newWidth, newHeight]);
      
      if (layoutEngine === 'force') {
        const uniqueGroups = Array.from(new Set(simulationNodes.map(n => n.group)));
        const groupCenters: Record<number, {x: number, y: number}> = {};
        const clusterRadius = Math.min(newWidth, newHeight) * 0.32;
        uniqueGroups.forEach((g, i) => {
           const angle = (i / uniqueGroups.length) * 2 * Math.PI - Math.PI / 2;
           groupCenters[Number(g)] = {
              x: newWidth / 2 + clusterRadius * Math.cos(angle),
              y: newHeight / 2 + clusterRadius * Math.sin(angle)
           };
        });
        
        simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
        simulation.force('x', d3.forceX().strength(0.12).x((d: any) => groupCenters[d.group]?.x || newWidth / 2));
        simulation.force('y', d3.forceY().strength(0.12).y((d: any) => groupCenters[d.group]?.y || newHeight / 2));
      } else {
        simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
      }
      
      simulation.alpha(0.3).restart();
    });

    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }

    return () => {
      simulation.stop();
      resizeObserver.disconnect();
    };
  }, [nodes, links, isFullscreen, layoutEngine]);

  // Handle active states (selection, filtering) dynamically on existing DOM
  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;
    const svg = d3.select(containerRef.current).select('svg');
    if (svg.empty()) return;

    const circles = svg.selectAll('circle');
    const lines = svg.selectAll('line');
    const texts = svg.selectAll('.labels text');

    // 1. If subject filter or status filter is set, dim excluded elements
    const isFilteredActive = subjectFilter !== 'all' || statusFilter !== 'all';

    // 2. Compute selected node's neighborhood mapping
    const connectedNodeIds = new Set<string>();
    if (selectedNodeId) {
      connectedNodeIds.add(selectedNodeId);
      links.forEach(l => {
        const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        if (srcId === selectedNodeId) {
          connectedNodeIds.add(tgtId);
        } else if (tgtId === selectedNodeId) {
          connectedNodeIds.add(srcId);
        }
      });
    }

    const getGroupColor = (groupNum: number) => {
      const colors = ['#38bdf8', '#818cf8', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#fb7185'];
      return colors[(groupNum - 1) % colors.length] || '#38bdf8';
    };

    // Update node styles
    circles.each(function(d: any) {
      if (!d) return;
      const matchFilters = isNodeVisibleByFilters(d);
      const isSelected = d.id === selectedNodeId;
      const isNeighbor = connectedNodeIds.has(d.id);
      const nodeEl = d3.select(this);

      if (!matchFilters) {
        nodeEl
          .style('opacity', 0.05)
          .attr('stroke', '#000000')
          .attr('stroke-width', 1);
        return;
      }

      // Update fill color dynamically to respond to state changes
      let targetFill = '#64748b';
      if (d.status === 'mastered') {
        targetFill = '#10b981';
      } else if (d.status === 'reading' || d.status === 'learning') {
        targetFill = '#fbbf24';
      } else {
        // If unstarted, paint with beautiful core subject color if filtered or main topic or neighbors
        const showActiveColor = d.radius > 15 || subjectFilter !== 'all' || (selectedNodeId && connectedNodeIds.has(d.id));
        targetFill = showActiveColor ? getGroupColor(d.group) : '#475569';
      }
      nodeEl.attr('fill', targetFill);

      if (selectedNodeId) {
        if (isSelected) {
          nodeEl
            .style('opacity', 1)
            .attr('stroke', '#38bdf8') // Golden / Cyan glowing stroke
            .attr('stroke-width', 3.5)
            .attr('filter', 'url(#glow)');
        } else if (isNeighbor) {
          nodeEl
            .style('opacity', 0.9)
            .attr('stroke', '#818cf8')
            .attr('stroke-width', 2);
        } else {
          nodeEl
            .style('opacity', 0.12)
            .attr('stroke', '#0f172a')
            .attr('stroke-width', 1.5)
            .attr('filter', 'none');
        }
      } else {
        nodeEl
          .style('opacity', 1)
          .attr('stroke', '#0f172a')
          .attr('stroke-width', d.radius > 15 ? 2.5 : 1.5)
          .attr('filter', 'none');
      }
    });

    // Update connection lines
    lines.each(function(d: any) {
      if (!d) return;
      const srcId = typeof d.source === 'object' ? d.source.id : d.source;
      const tgtId = typeof d.target === 'object' ? d.target.id : d.target;
      
      const sourceNodeObj = nodes.find(n => n.id === srcId);
      const targetNodeObj = nodes.find(n => n.id === tgtId);
      
      const isLinkVisible = sourceNodeObj && targetNodeObj && 
                             isNodeVisibleByFilters(sourceNodeObj) && 
                             isNodeVisibleByFilters(targetNodeObj);

      const lineEl = d3.select(this);

      if (!isLinkVisible) {
        lineEl.style('opacity', 0);
        return;
      }

      if (selectedNodeId) {
        const isConnected = srcId === selectedNodeId || tgtId === selectedNodeId;
        if (isConnected) {
          lineEl
            .style('opacity', 0.95)
            .attr('stroke', '#6366f1') // Violet high-contrast link line
            .attr('stroke-width', 3);
        } else {
          lineEl
            .style('opacity', 0.04)
            .attr('stroke', '#334155')
            .attr('stroke-width', 1);
        }
      } else {
        lineEl
          .style('opacity', 0.55)
          .attr('stroke', '#334155')
          .attr('stroke-width', Math.sqrt(d.value) * 1.5);
      }
    });

    // Update text labels
    texts.each(function(d: any) {
      if (!d) return;
      const textEl = d3.select(this);
      const matchesFilters = isNodeVisibleByFilters(d);

      if (!matchesFilters) {
        textEl.style('opacity', 0);
        return;
      }

      const isTargetCoreActive = subjectFilter !== 'all';
      const displayLabel = d.radius > 10 || isFullscreen || isTargetCoreActive || (selectedNodeId && connectedNodeIds.has(d.id));

      if (!displayLabel) {
        textEl.style('opacity', 0);
        return;
      }

      // Dynamically update label text string to visualise targeted nodes cleanly in full/generous length
      const isSelected = d.id === selectedNodeId;
      const isNeighbor = selectedNodeId && connectedNodeIds.has(d.id);
      
      let maxLen = 28;
      if (isSelected || isNeighbor) {
        maxLen = 85; 
      } else if (isTargetCoreActive) {
        maxLen = 65; 
      }

      const fullLabel = d.id;
      let renderedText = fullLabel;
      if (fullLabel.length > maxLen) {
        renderedText = fullLabel.substring(0, maxLen - 3) + '...';
      }
      textEl.text(renderedText);

      // Apply gorgeous high-contrast styling and color pairings depending on state
      if (selectedNodeId) {
        if (isSelected) {
          textEl
            .style('opacity', 1)
            .attr('font-weight', '900')
            .attr('font-size', d.radius > 15 ? '13px' : '11px')
            .attr('fill', '#22d3ee'); // bright neon cyan
        } else if (isNeighbor) {
          textEl
            .style('opacity', 0.95)
            .attr('font-weight', '700')
            .attr('font-size', '11px')
            .attr('fill', '#f1f5f9'); // high contrast soft white
        } else {
          textEl.style('opacity', 0.08); // heavily dim inactive
        }
      } else if (isTargetCoreActive) {
        // High contrast styling for target core category texts so users can read them clearly!
        const isOfActiveGroup = d.group === subjectFilter;
        textEl
          .style('opacity', isOfActiveGroup ? 1 : 0.35)
          .attr('font-weight', d.radius > 15 ? '800' : (isOfActiveGroup ? '700' : '600'))
          .attr('font-size', d.radius > 15 ? '13px' : '11px')
          .attr('fill', isOfActiveGroup ? (d.radius > 15 ? '#22d3ee' : getGroupColor(d.group)) : '#94a3b8');
      } else {
        textEl
          .style('opacity', d.radius > 15 ? 1 : 0.65) // Dim smaller uncategorized text slightly for rhythm/hierarchy
          .attr('font-weight', d.radius > 15 ? '700' : '500')
          .attr('font-size', d.radius > 15 ? '12px' : '10px')
          .attr('fill', '#cbd5e1'); // soft slate
      }
    });

  }, [selectedNodeId, subjectFilter, statusFilter, nodes, links, isFullscreen, isNodeVisibleByFilters]);

  // Autocomplete suggestions for search input
  const searchSuggestions = searchQuery.trim() === '' ? [] :
    nodes.filter(n => n.id.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8);

  const handleJumpToNotes = () => {
    if (!selectedNodeId) return;
    if (onNavigate) {
      onNavigate('notes');
      setTimeout(() => {
        window.document.dispatchEvent(new CustomEvent('app:search-notes', { detail: selectedNodeId }));
      }, 150);
    }
  };

  return (
    <div className={`bg-app glass-panel border border-panel-border rounded-2xl p-6 flex flex-col relative z-20 w-full mb-6 transition-all ${isFullscreen ? 'fixed inset-4 z-[999]' : ''}`}>
      
      {/* 1. Scoreboard Heading Metrics */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 mb-5 border-b border-panel-border/50 gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-main uppercase tracking-wider flex items-center gap-2">
            <Network className="w-5.5 h-5.5 text-accent" /> Syllabus Connectivity Map
          </h3>
          <p className="text-[11px] text-muted leading-relaxed font-semibold">
            Observe connection lines between papers. Click on nodes to load study summaries & edit progress states directly.
          </p>
        </div>

        {/* Dynamic score summary badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black flex items-center gap-1.5 uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mastered: {masteredCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-black flex items-center gap-1.5 uppercase shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Reading: {readingCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[11px] font-black flex items-center gap-1.5 uppercase shadow-sm">
            <span>Pending: {pendingCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Bento Board Grid Splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Left Side: Visualizer Stage with built-in tool headers */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-panel border border-panel-border/50 p-2.5 rounded-xl">
            
            {/* Filter Group: Subjects */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-accent" /> Target Core:
              </span>
              <div className="flex flex-wrap rounded-lg bg-panel-border/10 overflow-hidden border border-panel-border/30 p-0.5">
                <button
                  type="button"
                  onClick={() => setSubjectFilter('all')}
                  className={`px-2 py-1 text-[10px] font-black uppercase rounded ${subjectFilter === 'all' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-main'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectFilter(1)}
                  className={`px-2 py-1 text-[10px] font-black uppercase rounded ${subjectFilter === 1 ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-main'}`}
                  title="GS I: History, Geography & Indian Society"
                >
                  GS I
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectFilter(2)}
                  className={`px-2 py-1 text-[10px] font-black uppercase rounded ${subjectFilter === 2 ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-main'}`}
                  title="GS II: Polity, Constitution & Governance"
                >
                  GS II
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectFilter(3)}
                  className={`px-2 py-1 text-[10px] font-black uppercase rounded ${subjectFilter === 3 ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-main'}`}
                  title="GS III: S&T, Economy & Environment"
                >
                  GS III
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectFilter(4)}
                  className={`px-2 py-1 text-[10px] font-black uppercase rounded ${subjectFilter === 4 ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-main'}`}
                  title="GS IV: Ethics, Integrity & Aptitude"
                >
                  GS IV
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectFilter(5)}
                  className={`px-2 py-1 text-[10px] font-black uppercase rounded ${subjectFilter === 5 ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-main'}`}
                  title="Prelims & CSAT Core Topics"
                >
                  Prelims
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectFilter(6)}
                  className={`px-2 py-1 text-[10px] font-black uppercase rounded ${subjectFilter === 6 ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-main'}`}
                  title="Essay and Optionals"
                >
                  Optionals
                </button>
              </div>
            </div>

            {/* Layout Engine select & screen controllers */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Autocomplete Search input */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-light shrink-0" />
                <input
                  type="text"
                  placeholder="Navigate map..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-app border border-panel-border rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-main w-[160px] focus:outline-none focus:border-accent transition-colors placeholder:text-muted"
                />
                
                {/* Search Dropdown */}
                {searchSuggestions.length > 0 && (
                  <div className="absolute top-full right-0 mt-1 bg-panel border-2 border-panel-border/90 rounded-xl shadow-2xl z-50 w-[240px] max-h-48 overflow-y-auto p-1 divide-y divide-panel-border/30">
                    {searchSuggestions.map(n => (
                      <button
                        key={n.id}
                        onClick={() => {
                          zoomToNodeId(n.id);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-2 text-[11px] hover:bg-input hover:text-accent rounded-lg font-bold truncate flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="truncate max-w-[150px]">{n.id}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider uppercase scale-90 ${
                          n.status === 'mastered' ? 'bg-emerald-500/10 text-emerald-400' :
                          n.status === 'reading' || n.status === 'learning' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {n.status === 'reading' ? 'reading' : n.status === 'mastered' ? 'mastered' : 'pending'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View options */}
              <select 
                value={layoutEngine}
                onChange={(e) => setLayoutEngine(e.target.value as 'force' | 'tree')}
                className="bg-transparent border border-panel-border rounded-lg px-2 py-1.5 text-[10px] font-black text-muted uppercase hover:text-accent outline-none cursor-pointer h-8"
              >
                <option value="force" className="bg-panel normal-case text-main text-[11px]">Force-Directed</option>
                <option value="tree" className="bg-panel normal-case text-main text-[11px]">Hierarchical Papers</option>
              </select>

              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 px-2.5 hover:bg-input border border-panel-border rounded-lg text-muted hover:text-main text-[10px] font-black uppercase transition-colors shrink-0 h-8 flex items-center justify-center gap-1"
                title="Fit all nodes safely inside stage bounds"
              >
                Reset Fit
              </button>

              <button 
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className="p-1.5 hover:bg-input border border-panel-border rounded-lg text-muted hover:text-main transition-colors shrink-0 h-8 flex items-center justify-center"
                title={isFullscreen ? "Minimize view" : "Maximize view"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* D3 Simulation Element Container - High Contrast Dark Slate Dashboard Layout */}
          <div className="relative rounded-2xl overflow-hidden border border-panel-border/80 shadow-inner bg-[#0b0f19]">
            
            {/* Interactive guidelines Overlay */}
            <div className="absolute top-3 left-3 bg-[#0d1527]/80 backdrop-blur border border-panel-border/40 px-2.5 py-1.5 rounded-lg text-[9px] text-light font-bold flex items-center gap-2 uppercase tracking-wide pointer-events-none">
              <Clock className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span>Drag to position • Scroll to zoom • Select node to inspect</span>
            </div>

            <div 
               ref={containerRef} 
               className="w-full relative cursor-move"
               style={{ height: isFullscreen ? 'calc(100vh - 16rem)' : '440px' }}
            />
          </div>
        </div>

        {/* Right Side: Concept Inspector & Syllabus Tracker Integration Sidepanel */}
        <div className="lg:col-span-1 flex flex-col bg-panel/40 border border-panel-border/80 rounded-2xl p-4.5 shadow-sm overflow-y-auto max-h-[500px] lg:max-h-none h-full justify-between gap-4">
          
          {selectedNode ? (
            <div className="flex-1 flex flex-col justify-between h-full gap-5">
              
              {/* Node Metadata heading */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2 border-b border-panel-border/30 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-accent shrink-0 animate-spin-slow" />
                    <span className="text-[10px] font-black uppercase text-[#94a3b8] tracking-widest leading-none">
                      Concept Selected
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded border border-panel-border text-[9px] font-black bg-[#94a3b8]/10 text-main uppercase">
                    {selectedNode.group === 1 ? 'GS I' : 
                     selectedNode.group === 2 ? 'GS II' : 
                     selectedNode.group === 3 ? 'GS III' : 
                     selectedNode.group === 4 ? 'GS IV' : 
                     selectedNode.group === 5 ? 'PRELIMS' : 
                     'OPTIONAL / ESSAY'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-black text-main leading-snug tracking-tight">{selectedNode.id}</h4>
                  
                  {/* Current syllabus state indicator */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-muted font-bold">Workspace status:</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                      selectedNode.status === 'mastered' ? 'bg-emerald-500/10 text-emerald-400' :
                      selectedNode.status === 'reading' || selectedNode.status === 'learning' ? 'bg-amber-500/10 text-amber-400 animate-pulse' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {selectedNode.status === 'reading' ? 'READING' : selectedNode.status === 'mastered' ? 'MASTERED' : 'NOT STARTED'}
                    </span>
                  </div>
                </div>

                {/* State selector toolbar inside inspector */}
                <div className="space-y-1.5 bg-input/40 border border-panel-border/40 p-3 rounded-xl">
                  <label className="text-[10px] font-black uppercase text-muted tracking-wider block">Modify Study Status:</label>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedNode.id, 'not_started')}
                      className={`py-1 rounded text-[9.5px] font-extrabold uppercase transition-all flex items-center justify-center cursor-pointer ${selectedNode.status === 'not_started' ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' : 'bg-panel hover:bg-input border border-panel-border text-muted'}`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedNode.id, 'reading')}
                      className={`py-1 rounded text-[9.5px] font-extrabold uppercase transition-all flex items-center justify-center cursor-pointer ${selectedNode.status === 'reading' || selectedNode.status === 'learning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-panel hover:bg-input border border-panel-border text-muted'}`}
                    >
                      Reading
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedNode.id, 'mastered')}
                      className={`py-1 rounded text-[9.5px] font-extrabold uppercase transition-all flex items-center justify-center cursor-pointer ${selectedNode.status === 'mastered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black' : 'bg-panel hover:bg-input border border-panel-border text-muted'}`}
                    >
                      Mastered
                    </button>
                  </div>
                </div>

                {/* AI Syllabus Explanation */}
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-black uppercase text-muted tracking-wider block">Description & Core Essence:</label>
                  <div className="bg-input/20 border border-panel-border/30 rounded-xl p-3 max-h-[140px] overflow-y-auto">
                    <p className="text-[11.5px] text-main leading-relaxed font-semibold">
                      {selectedNode.summary || 'Essential core topic required for descriptive general studies strategy, explore correlated notes.'}
                    </p>
                  </div>
                </div>

                {/* Linked connections list */}
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-black uppercase text-muted tracking-wider block">Connected Prerequisites:</label>
                  <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto">
                    {selectedNodeNeighbors.length === 0 ? (
                      <span className="text-[10px] text-muted italic">No direct connections mapped</span>
                    ) : (
                      selectedNodeNeighbors.map(nb => (
                        <button
                          key={nb}
                          onClick={() => zoomToNodeId(nb)}
                          className="px-2 py-1 rounded-lg hover:border-accent border border-panel-border bg-panel text-[10px] font-bold text-main flex items-center gap-1 transition-colors hover:text-accent cursor-pointer"
                        >
                          {nb} <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Study Sync Buttons */}
              <div className="space-y-2 border-t border-panel-border/30 pt-3">
                <button
                  type="button"
                  onClick={handleJumpToNotes}
                  className="w-full h-9 flex items-center justify-center gap-2 border border-accent/25 hover:bg-accent/15 bg-accent/5 text-accent text-[11px] font-black uppercase rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  Jump to Study Notes
                </button>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 lg:py-0 h-full gap-4 text-muted min-h-[300px]">
              <div className="w-12 h-12 rounded-full border border-panel-border/40 bg-panel/60 flex items-center justify-center text-light shadow-sm">
                <Compass className="w-6 h-6 animate-spin-slow text-accent opacity-75" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase text-main">Empty Selection</p>
                <p className="text-[11px] text-muted leading-normal max-w-[200px] mx-auto font-medium">
                  Click on any topic node inside the Connectivity Map to inspect core summaries, edit study progress, and view materials.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
