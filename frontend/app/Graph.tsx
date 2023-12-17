import React, { useRef, useEffect } from 'react';

type GraphData = {
  nodes: { id: string; x: number; y: number; }[];
};

const Graph: React.FC<{ data: GraphData }> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && data && Array.isArray(data.nodes)) {
      const canvas = canvasRef.current;
      const gl = canvas.getContext('webgl');

      if (gl === null) {
        console.error('Unable to initialize WebGL. Your browser may not support it.');
        return;
      }
    
      
      // WebGL initialization and rendering code goes here
      // Convert your data to a format suitable for WebGL and use it for rendering
    }
  }, [data]);

  return (
    <canvas ref={canvasRef} width={1400} height={1100} />
  );
};

export default Graph;
