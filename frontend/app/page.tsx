'use client'

import React, { useState, useEffect } from 'react';
import Graph from './d3fc';

export default function Home() {
  const [query, setQuery] = useState('');
  const [urls, setUrls] = useState([]);
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    // Define the function to fetch graph data
    const fetchGraphData = async () => {
      try {
        const response = await fetch('http://ee-tik-vm054.ethz.ch:8000/graph-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: GraphData = await response.json();
        setGraphData(data); // Set the graph data in state
      } catch (error) {
        console.error("Could not fetch graph data:", error);
      }
    };

    fetchGraphData(); // Call the function to fetch graph data
  }, []);



  

  const handleSearchKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      try {
        const result = await fetch(`http://ee-tik-vm054.ethz.ch:8000/search?query=${query}`);
        const data = await result.json();
        setUrls(data);
      } catch (error) {
        console.error("Could not fetch search results:", error);
      }
    }
  };

  return (
    
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', margin: 10 }}>
      <div style={{ marginBottom: '10px', marginTop: 10 }}>
        <input
          style={{ border: '2px solid black', borderRadius: '15px', padding: '5px', textAlign: 'center' }}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search...'
          value={query}
            onKeyDown={handleSearchKeyDown}
          />
      </div>
      <div className='flex flex-row center items-start p-0'>
        <div style={{ width: 1800 }}>
          {graphData && <Graph data={graphData} />}
        </div>
        <div className='w-1/3' style={{ height: "100%", display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '3px' }}> {/* Grid container for videos and audios */}
          {urls.map((urlPair, index) => (
            <div key={index} style={{ marginBottom: '0px' }}> {/* Container for each video and audio pair */}
              <div className="video-container" style={{ overflow: 'hidden', position: 'relative', paddingBottom: '50.25%', height: 0 }}>
                <iframe
                  title={`Embedded Video ${index}`}
                  src={`https://www.youtube.com/embed/${new URL(urlPair[0]).searchParams.get('v')}`}
                  className="video-iframe"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </div>
              <audio
                title={`Audio Preview ${index}`}
                src={urlPair[1]}
                controls
                style={{ width: '100%' }} // Ensure the audio player spans the full width of the grid column
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}


