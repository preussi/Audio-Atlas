'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Info } from 'lucide-react';
import { DeepscatterPlotDynamic } from './components/DeepscatterPlotDynamic';
import type { DeepscatterPlotHandle } from './components/DeepscatterPlot';
import { DATASET_CONFIGS } from './components/datasetConfigs';
import SongTile from './components/SongTile';
import AudioPlayer from './components/AudioPlayer';
import InfoModal from './components/InfoModal';

// All API requests go through Next.js rewrites (see next.config.ts) so the
// browser only needs to reach the frontend origin — no cross-origin issues.
const API_URL = '';

function filterUniqueById(jsonResponse: unknown): any[] {
  if (!Array.isArray(jsonResponse)) return [];
  const uniqueIds = new Set();
  return jsonResponse.filter((obj) => {
    if (uniqueIds.has(obj.id)) return false;
    uniqueIds.add(obj.id);
    return true;
  });
}

export default function Home() {
  const [selectedDataset, setSelectedDataset] = useState('fma');
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [query, setQuery] = useState('');
  const [urls, setUrls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [audioSource, setAudioSource] = useState('');

  const plotRef = useRef<DeepscatterPlotHandle>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const isMobile = typeof window !== 'undefined' && /Mobi/i.test(window.navigator.userAgent);

  const datasetConfig = DATASET_CONFIGS[selectedDataset];

  // --- Helpers ---

  const generateAudioLink = useCallback(
    (id: string) => {
      let parts = id.split('\\');
      let fileName = parts[parts.length - 1];
      if (selectedDataset === 'jamendo') {
        parts = fileName.split('/');
        fileName = parts[4];
        fileName = fileName + '.low.mp3';
      }
      if (selectedDataset === 'fma') {
        fileName = `${fileName}.mp3`;
      }
      return `${API_URL}/data/audio/${selectedDataset}/${fileName}`;
    },
    [selectedDataset],
  );

  const getYouTubeThumbnail = useCallback(
    (id: string, quality = 'default') => {
      const base = 'https://img.youtube.com/vi/';
      const qualityMap: Record<string, string> = {
        high: 'hqdefault.jpg',
        medium: 'mqdefault.jpg',
        standard: 'sddefault.jpg',
        max: 'maxresdefault.jpg',
        default: 'default.jpg',
      };
      const qualityPath = qualityMap[quality] || 'default.jpg';

      if (selectedDataset === 'disco') {
        const urlObj = new URL(id);
        const link = urlObj.searchParams.get('v');
        return `${base}${link}/${qualityPath}`;
      }
      return `${base}${id}/default.jpg`;
    },
    [selectedDataset],
  );

  const generateYouTubeUrl = useCallback(
    (item: any) => {
      let startTime = '';
      if (selectedDataset === 'disco') {
        const urlObj = new URL(item.link);
        const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/')[1];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      if (selectedDataset === 'yt8m' && item.start && !isNaN(item.start)) {
        startTime = `?start=${item.start}`;
      }
      if (selectedDataset === 'musiccaps' && item.start_s && !isNaN(item.start_s)) {
        startTime = `?start=${item.start_s}`;
      }
      return `https://www.youtube.com/embed/${item.link}${startTime}`;
    },
    [selectedDataset],
  );

  // --- Data fetching ---

  const handleSearchResults = useCallback(
    (data: any[]) => {
      if (!data || data.length === 0) return;
      setUrls(data);
      setAudioSource(generateAudioLink(data[0].link));
      setSearchInitiated(true);
      setIsOverlayVisible(true);
      plotRef.current?.zoomTo(data[0].x, data[0].y);
    },
    [generateAudioLink],
  );

  const retrieve = useCallback(
    async (id: number) => {
      try {
        const response = await fetch(`${API_URL}/retrieve/${id}/${selectedDataset}`);
        const data = filterUniqueById(await response.json());
        handleSearchResults(data);
      } catch (error) {
        console.error('Could not fetch search results:', error);
      }
    },
    [selectedDataset, handleSearchResults],
  );

  const handleSearchKeyDown = async (event: React.KeyboardEvent) => {
    if (event.key !== 'Enter') return;
    try {
      const response = await fetch(`${API_URL}/search/${query}/${selectedDataset}`);
      const data = filterUniqueById(await response.json());
      setTimeout(() => handleSearchResults(data), 3000);
    } catch (error) {
      console.error('Could not fetch search results:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | { target: { files: File[] } }) => {
    setIsLoading(true);
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dataset', selectedDataset);
      try {
        const response = await fetch(`${API_URL}/upload-audio/`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = filterUniqueById(await response.json());
        handleSearchResults(data);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    setIsLoading(false);
  };

  // --- Event handlers ---

  const handleDatasetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataset(event.target.value);
    setSearchInitiated(false);
    setIsOverlayVisible(false);
  };

  const triggerFileInputClick = () => {
    document.getElementById('fileInput')?.click();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files?.length > 0) {
      handleFileUpload({ target: { files: [event.dataTransfer.files[0]] } });
    }
  };

  // Close results on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchInitiated && isOverlayVisible && resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setSearchInitiated(false);
        setIsOverlayVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchInitiated, isOverlayVisible]);

  // --- Render helpers ---

  const generateMetadataContent = () => {
    if (urls.length === 0) return <p>No results to display.</p>;
    const mainResult = urls[0];
    return (
      <div>
        {Object.entries(mainResult).map(([key, value], index) => {
          if (['id', 'link', 'x', 'y'].includes(key)) return null;
          const displayName = key.split('_').join(' ').replace(/(\b\w)/gi, (m) => m.toUpperCase());
          if (displayName === 'Class') {
            return <p key={index}>{`Zero-shot classification: ${value ?? 'Unknown'}`}</p>;
          }
          return <p key={index}>{`${displayName}: ${value ?? 'Unknown'}`}</p>;
        })}
      </div>
    );
  };

  const renderContent = (item: any) => {
    if (datasetConfig?.isOnline) {
      return (
        <iframe
          src={generateYouTubeUrl(item)}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Video Player"
        />
      );
    }
    return (
      <div style={{ width: '100%', alignItems: 'center' }}>
        <AudioPlayer audioSource={audioSource} />
      </div>
    );
  };

  // --- Styles ---

  const searchResultsWidth = isMobile ? '90%' : '50%';
  const mainResultHeight = isMobile ? '25vh' : '40vh';

  return (
    <main
      style={{
        position: 'fixed',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      {/* Deepscatter visualization - direct React component, no iframe */}
      <DeepscatterPlotDynamic
        ref={plotRef}
        dataset={selectedDataset}
        apiUrl={API_URL}
        onNodeClick={retrieve}
      />

      {/* Overlay */}
      {isOverlayVisible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        />
      )}

      {/* Top bar */}
      <div
        style={{
          zIndex: 2,
          padding: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
        }}
      >
        {!isMobile && <div style={{ visibility: 'hidden', width: '15%' }} />}

        {/* Search container */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            maxWidth: '500px',
            padding: '6px 8px',
            borderRadius: '15px',
            border: '1px solid white',
          }}
        >
          <input
            style={{
              outline: 'none',
              margin: '0 10px',
              color: 'white',
              backgroundColor: 'transparent',
              flexGrow: 1,
              ...(isMobile ? { width: '100%' } : {}),
            }}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Audio Atlas"
            value={query}
            onKeyDown={handleSearchKeyDown}
          />
          <button
            onClick={triggerFileInputClick}
            style={{
              background: 'none',
              transform: 'scale(0.9)',
              color: 'white',
              border: '1px dashed white',
              borderRadius: '10px',
              cursor: 'pointer',
              padding: '8px 12px',
            }}
          >
            Upload
          </button>
          <input
            type="file"
            id="fileInput"
            accept=".mp3,.wav"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>

        {/* Dataset selector + info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            margin: '10px',
            width: isMobile ? '30%' : '15%',
          }}
        >
          <select
            onChange={handleDatasetChange}
            value={selectedDataset}
            style={{
              background: 'transparent',
              color: 'white',
              listStyle: 'revert',
              marginRight: '10px',
              overflow: 'hidden',
            }}
          >
            <option value="fma">FMA</option>
            <option value="jamendo">Jamendo</option>
            <option value="yt8m">YT8M MTC</option>
            <option value="musiccaps">MusicCaps</option>
            <option value="vctk">VCTK</option>
            <option value="ESC50">ESC-50</option>
          </select>
          <button
            onClick={() => setIsModalVisible(true)}
            style={{ color: 'white', cursor: 'pointer' }}
          >
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchInitiated && (
        <div
          ref={resultsRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '700px',
            width: searchResultsWidth,
            zIndex: 2,
            overflowY: 'auto',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            padding: '10px',
            borderRadius: '20px',
          }}
        >
          {urls.length > 0 && renderContent(urls[0])}

          <div
            style={{
              padding: '10px',
              color: 'white',
              margin: '10px 0',
              ...(isMobile ? { fontSize: '14px', height: '150px', overflowY: 'auto' as const } : {}),
            }}
          >
            {generateMetadataContent()}
          </div>

          <h2 style={{ color: 'white', textAlign: 'center' }}>Most similar according to AI</h2>

          {urls.length > 1 && (
            <div style={{ overflowY: 'auto', padding: '10px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                {urls.slice(1).map((item, index) => (
                  <SongTile
                    key={index}
                    title={item.title}
                    thumbnailUrl={datasetConfig?.isOnline ? getYouTubeThumbnail(item.link, 'max') : undefined}
                    onClick={() => retrieve(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drag & drop zone */}
      {!searchInitiated && (
        <div
          className={`file-drop-container ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        >
          {isLoading && <div className="loading-animation" />}
          {!isLoading && !isMobile && (
            <p style={{ color: '#666', fontSize: '16px' }}>
              Drag &amp; Drop your audio file here
            </p>
          )}
          <input
            type="file"
            id="fileInput"
            accept=".mp3,.wav"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>
      )}

      <InfoModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} />
    </main>
  );
}
