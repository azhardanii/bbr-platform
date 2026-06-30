"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

export type GraphData = {
  nodes: { id: string; group: number; size: number; label: string }[];
  links: { source: string; target: string; value: number }[];
};

export default function NetworkGraph({ data }: { data: GraphData }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !containerRef.current) return;

    // Clear previous SVG
    containerRef.current.innerHTML = "";

    const width = containerRef.current.clientWidth || 800;
    const height = 600;

    // Clone data because d3 modifies it
    const links = data.links.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    // Define colors for groups
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => d.size + 15));

    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; background-color: #ffffff;");

    // Add a subtle white background explicitly for export
    svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "#ffffff");

    // Container for zooming
    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
      
    svg.call(zoom);

    // Draw links
    const link = g.append("g")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.max(1, Math.sqrt(d.value)));

    // Draw nodes container
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Draw circles inside nodes
    node.append("circle")
      .attr("r", d => d.size)
      .attr("fill", d => color(d.group.toString()))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("opacity", 0.9);

    // Draw text labels
    node.append("text")
      .text(d => d.label)
      .attr("x", 0)
      .attr("y", d => d.size + 14)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-family", "sans-serif")
      .attr("font-weight", "600")
      .attr("fill", "#1e293b")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 3)
      .attr("paint-order", "stroke");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => Math.max(20, Math.min(width - 20, d.source.x)))
        .attr("y1", (d: any) => Math.max(20, Math.min(height - 20, d.source.y)))
        .attr("x2", (d: any) => Math.max(20, Math.min(width - 20, d.target.x)))
        .attr("y2", (d: any) => Math.max(20, Math.min(height - 20, d.target.y)));

      node
        .attr("transform", (d: any) => {
           d.x = Math.max(20, Math.min(width - 20, d.x));
           d.y = Math.max(20, Math.min(height - 20, d.y));
           return `translate(${d.x},${d.y})`;
        });
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return <div ref={containerRef} className="w-full h-full min-h-[600px] overflow-hidden rounded-xl bg-white network-graph-container" />;
}
