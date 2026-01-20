
import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { Container, Carton, PackingResult } from '../types';

interface VisualizerProps {
  container: Container;
  cartons: Carton[];
  result: PackingResult;
}

const Visualizer: React.FC<VisualizerProps> = ({ container, cartons, result }) => {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plotRef.current) return;

    const data: any[] = [];

    // 1. Container Floor (Subtle Shadow Plane)
    data.push({
      type: 'mesh3d',
      x: [0, container.length, container.length, 0],
      y: [0, 0, container.width, container.width],
      z: [-0.01, -0.01, -0.01, -0.01], // Slightly below floor to avoid z-fighting
      color: '#cbd5e1',
      opacity: 0.2,
      name: 'Floor',
      hoverinfo: 'none'
    });

    // 2. Container Bounding Box (Wireframe)
    data.push({
      type: 'scatter3d',
      mode: 'lines',
      x: [0, container.length, container.length, 0, 0, 0, container.length, container.length, 0, 0, 0, 0, container.length, container.length, container.length, container.length],
      y: [0, 0, container.width, container.width, 0, 0, 0, container.width, container.width, 0, container.width, container.width, container.width, 0, 0, container.width],
      z: [0, 0, 0, 0, 0, container.height, container.height, container.height, container.height, container.height, container.height, 0, 0, 0, container.height, container.height],
      line: { color: '#1e293b', width: 2 },
      hoverinfo: 'none',
      showlegend: false
    });

    // 3. Packed Cartons
    const maxVisible = 1200;
    const step = Math.ceil(result.packedItems.length / maxVisible);

    result.packedItems.forEach((item, idx) => {
      if (idx % step !== 0) return;
      const c = cartons.find(ct => ct.id === item.cartonId);
      if (!c) return;

      const { x, y, z } = item;
      const { length: l, width: w, height: h } = c;

      data.push({
        type: 'mesh3d',
        x: [x, x + l, x + l, x, x, x + l, x + l, x],
        y: [y, y, y + w, y + w, y, y, y + w, y + w],
        z: [z, z, z, z, z + h, z + h, z + h, z + h],
        i: [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2],
        j: [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3],
        k: [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
        color: item.color,
        opacity: 1,
        flatshading: true,
        lighting: {
          ambient: 0.6,
          diffuse: 0.7,
          specular: 0.05,
          roughness: 0.9,
          fresnel: 0.2
        },
        lightposition: { x: 50, y: 50, z: 1000 },
        hoverinfo: 'text',
        text: `<b>${c.name}</b><br>Pos: ${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}<br>Size: ${l}x${w}x${h}m`,
        showlegend: false
      });
    });

    const layout = {
      autosize: true,
      margin: { l: 0, r: 0, b: 0, t: 0 },
      scene: {
        aspectmode: 'data',
        xaxis: { title: 'Length (X)', showbackground: false, showgrid: true, gridcolor: '#f1f5f9' },
        yaxis: { title: 'Width (Y)', showbackground: false, showgrid: true, gridcolor: '#f1f5f9' },
        zaxis: { title: 'Height (Z)', showbackground: false, showgrid: true, gridcolor: '#f1f5f9' },
        camera: { 
          eye: { x: 1.6, y: 1.6, z: 1.1 },
          up: { x: 0, y: 0, z: 1 }
        }
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
    };

    Plotly.newPlot(plotRef.current, data, layout as any, { responsive: true, displayModeBar: false });

    return () => { if (plotRef.current) Plotly.purge(plotRef.current); };
  }, [container, cartons, result]);

  return <div ref={plotRef} className="w-full h-[600px] bg-slate-50/50 rounded-xl overflow-hidden cursor-move border border-slate-200 shadow-inner" />;
};

export default Visualizer;
