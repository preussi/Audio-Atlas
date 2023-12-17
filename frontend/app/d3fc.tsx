import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as fc from 'd3fc';


const Graph = ({ data }) => {
  const chartContainerRef = useRef(null);
  const [visibleData, setVisibleData] = useState(data.nodes);
  const xScale = d3.scaleLinear().domain(d3.extent(data.nodes, d => d.x));
  const yScale = d3.scaleLinear().domain(d3.extent(data.nodes, d => d.y));
  const xScaleOriginal = xScale.copy();
  const yScaleOriginal = yScale.copy();
  
  useEffect(() => {
  
    const scatter = fc.seriesCanvasPoint()
      .crossValue(d => d.x)
      .mainValue(d => d.y)
      .size(10)
      .decorate(context => {
        context.fillStyle = 'black'; // Set the fill color to black
        context.beginPath();
        context.arc(0, 0, 1, 0, 2 * Math.PI); // Draw a circle for each point
        context.fill();
      });
      
      const zoom = d3
        .zoom()
        .scaleExtent([1, 10])
        .on('zoom', (event) => {
          xScale.domain(event.transform.rescaleX(xScaleOriginal).domain());
          yScale.domain(event.transform.rescaleY(yScaleOriginal).domain());
          updateVisibleData(); // Update the visible data based on the new scale
          redraw();
        })

      const updateVisibleData = () => {
        // Function to update the visible data based on the current zoom level and position
        const xDomain = xScale.domain();
        const yDomain = yScale.domain();
  
        // Filter the data based on the current domain
        const newData = data.nodes.filter(d => 
          d.x >= xDomain[0] && d.x <= xDomain[1] &&
          d.y >= yDomain[0] && d.y <= yDomain[1]);
  
        setVisibleData(newData);
      };
        
    /*const zoom = d3.zoom()
    .scaleExtent([1, 10]) // Example: Allow zooming in up to 10 times, no zooming out beyond initial scale
    .translateExtent([[0, 0], [1, 1]]) // Replace 'width' and 'height' with actual values
    .on('zoom', (event) => {
      xScale.domain(event.transform.rescaleX(xScaleOriginal).domain());
      yScale.domain(event.transform.rescaleY(yScaleOriginal).domain());
      redraw();
    });

    const makeAnnotations = d3.annotation()
      .notePadding(15)
      .accessors({
        x: d => d.x,
        y: d => d.y
      })
      .annotations(annotations)

    d3.select("svg")
      .append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotations)*/

    const chart = fc.chartCartesian(xScale, yScale)
      .canvasPlotArea(scatter)
      .decorate(sel => {
        sel.enter()
          .select('.plot-area')
          .call(zoom)
          .on("measure.range", (event) => {
            xScaleOriginal.range([0, event.detail.width]);
            yScaleOriginal.range([event.detail.height, 0]);
          })
          .call(zoom);
      });

    const redraw = () => {
      d3.select(chartContainerRef.current)
        .datum(visibleData)
        .call(chart);
    };

    redraw();

  }, [data.nodes]);

  return (
    <div className="chart-container">
      <div ref={chartContainerRef} id="scatter-plot" style={{ height: '100%' }}></div>
    </div>
  );
};

export default Graph;
