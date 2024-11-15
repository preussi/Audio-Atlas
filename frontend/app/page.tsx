'use client'
import React, { useState, useEffect, useRef } from 'react';
import SongTile from './SongTile';
import AudioPlayer from './AudioPlayer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const server = 'http://audio-atlas.ethz.ch:8000';
const deepscatter = 'http://audio-atlas.ethz.ch';
const deepscatter_send = 'http://audio-atlas.ethz.ch:3344';

export default function Home() {
  const [selectedDataset, setSelectedDataset] = useState('fma');
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [query, setQuery] = useState('');
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [audioSource, setAudioSource] = useState('');
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const mobileCheck = () => {
      let check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    };
    setIsMobileDevice(mobileCheck());
  }, []);

  const datasetConfigs = {
    disco: { isOnline: true },
    yt8m: { isOnline: true },
    musiccaps: { isOnline: true },
    vctk: { isOnline: false },
    ESC50: { isOnline: false },
    jamendo: { isOnline: false },
    fma: { isOnline: false },
  };

  const InfoModal = ({ isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
      }}>
        <div style={{
          width: '70%',
          minHeight: '30%',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <h2>Information</h2>
          <p>
            Audio Atlas is a website for visualizing vectorial databases. It uses Milvus DB for storing and retrieving data embeddings.
            For visualizing the data, it uses DeepScatter, a tool utilizing WebGL for efficiently rendering a 2D dot scatter. We provide a couple of databases to explore.
            Users can search the databases by uploading an audio file or by typing a query.
          </p>
          <button onClick={onClose} style={{ alignSelf: 'flex-end', marginTop: 'auto' }}>Close</button>
        </div>
      </div>
    );
  };

  const handleOpenModal = () => setIsModalVisible(true);
  const handleCloseModal = () => setIsModalVisible(false);

  const triggerFileInputClick = () => {
    document.getElementById('fileInput').click();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      handleFileUpload({ target: { files: [file] } });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDatasetChange = (event) => {
    setSelectedDataset(event.target.value);
    const iframe = document.getElementById('deepscatterIframe');
    const message = { type: 'SELECT_DATASET', dataset: event.target.value };
    console.log('Sending message to iframe:', message);
    if (iframe && 'contentWindow' in iframe) {
      iframe.contentWindow.postMessage(message, deepscatter_send);
    }
  };

  const getYouTubeThumbnail = (item, quality = 'default') => {
    const baseThumbnailUrl = 'https://img.youtube.com/vi/';
    let qualityPath;
    switch (quality) {
      case 'high':
        qualityPath = 'hqdefault.jpg';
        break;
      case 'medium':
        qualityPath = 'mqdefault.jpg';
        break;
      case 'standard':
        qualityPath = 'sddefault.jpg';
        break;
      case 'max':
        qualityPath = 'maxresdefault.jpg';
        break;
      default:
        qualityPath = 'default.jpg';
    }

    if (selectedDataset === 'disco') {
      const urlObj = new URL(item.link);
      const videoId = urlObj.searchParams.get('v');
      return `${baseThumbnailUrl}${videoId}/${qualityPath}`;
    } else {
      return `${baseThumbnailUrl}${item.link}/${qualityPath}`;
    }
  };

  const generateAudioLink = (link) => {
    let parts = link.includes('\\') ? link.split('\\') : link.split('/');
    let fileName = parts[parts.length - 1];
    console.log('File name:', fileName);

    if (selectedDataset === 'jamendo') {
      parts = link.split('/');
      console.log('Parts:', parts);
      if (parts.length > 4) {
        fileName = parts[4];
        console.log('File name:', fileName);
        fileName = fileName + '.low.mp3';
      } else {
        console.error('Invalid file path:', link);
        return null;
      }
    }

    if (selectedDataset === 'fma') {
      fileName = `${fileName}.mp3`;
    }
    const path = `${server}/data/audio/${selectedDataset}/${fileName}`;
    console.log('Generated audio path:', path);
    return path;
  };

  const generateYouTubeUrl = (item) => {
    let startTime = '';
    if (selectedDataset === 'disco') {
      const urlObj = new URL(item.link);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      const pathSegments = urlObj.pathname.split('/');
      const shortVideoId = pathSegments.length > 1 ? pathSegments[1] : null;
      if (shortVideoId) {
        return `https://www.youtube.com/embed/${shortVideoId}`;
      }
    }
    if (selectedDataset === 'yt8m') {
      const time = item.start;
      if (time && !isNaN(time)) {
        startTime = `?start=${time}`;
      }
    }

    if (selectedDataset === 'musiccaps') {
      const time = item.start_s;
      if (time && !isNaN(time)) {
        startTime = `?start=${time}`;
      }
    }
    return `https://www.youtube.com/embed/${item.link}${startTime}`;
  };

  const iframeSrc = deepscatter_send + `/${selectedDataset}.html`;

  function filterUniqueById(jsonResponse) {
    console.log("Filtering unique IDs from response:", jsonResponse);
    const uniqueIds = new Set();
    return jsonResponse.filter(obj => {
      const id = obj.id;
      if (uniqueIds.has(id)) {
        return false;
      } else {
        uniqueIds.add(id);
        return true;
      }
    });
  }

  const generateMetadataContent = () => {
    if (urls.length > 0) {
      const mainResult = urls[0];

      return (
        <div>
          {Object.entries(mainResult).map(([key, value], index) => {
            if (key === 'id' || key === 'link' || key === 'x' || key === 'y') return null;
            const displayName = key.split('_').join(' ').replace(/(\b\w)/gi, match => match.toUpperCase());
            if (displayName === 'Class') {
              return <p key={index}>{`Zero-shot classification: ${value ?? "Unknown"}`}</p>;
            }
            return <p key={index}>{`${displayName}: ${value ?? "Unknown"}`}</p>;
          })}
        </div>
      );
    }

    return <p>No results to display.</p>;
  };

  const handleFileUpload = async (event) => {
    setIsLoading(true);
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dataset", selectedDataset);

      try {
        const response = await fetch(server + '/upload-audio/', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = filterUniqueById(await response.json());

        if (data && data.length > 0) {
          setSearchInitiated(true);
          setUrls(data);
          setAudioSource(generateAudioLink(data[0].link));
          setIsOverlayVisible(true);

          const message = {
            type: 'searchZoom',
            x: data[0].x,
            y: data[0].y,
          };

          const iframe = document.getElementById('deepscatterIframe');
          if (iframe && 'contentWindow' in iframe) {
            iframe.contentWindow.postMessage(message, deepscatter_send);
          }
        } else {
          console.error('No data received from the server.');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const resultsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchInitiated && isOverlayVisible && resultsRef.current && !resultsRef.current.contains(event.target)) {
        setSearchInitiated(false);
        setIsOverlayVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchInitiated, isOverlayVisible]);

  const handleSearchKeyDown = async (event) => {
    if (event.key === 'Enter') {
      try {
        let searchUrl = server + `/search/${query}/${selectedDataset}`;

        const response = await fetch(searchUrl);
        const data = filterUniqueById(await response.json());

        if (data && data.length > 0) {
          setUrls(data);
          setAudioSource(generateAudioLink(data[0].link));
          setSearchInitiated(true);
          setIsOverlayVisible(true);

          const message = {
            type: 'searchZoom',
            x: data[0].x,
            y: data[0].y,
          };

          const iframe = document.getElementById('deepscatterIframe');
          if (iframe && 'contentWindow' in iframe) {
            iframe.contentWindow.postMessage(message, deepscatter_send);
          }
        } else {
          console.error('No data received from the server.');
        }

        console.log("Search results:", data);
      } catch (error) {
        console.error("Could not fetch search results:", error);
      }
    }
  };

  const retrieve = async (id) => {
    try {
      let url = server + `/retrieve/${id}/${selectedDataset}`;
      const response = await fetch(url);
      const data = filterUniqueById(await response.json());

      if (data && data.length > 0) {
        setAudioSource(generateAudioLink(data[0].link));
        setSearchInitiated(true);
        setUrls(data);
        setIsOverlayVisible(true);

        const message = {
          type: 'searchZoom',
          x: data[0].x,
          y: data[0].y,
        };
        console.log('Sending message to iframe:', message);

        const iframe = document.getElementById('deepscatterIframe');
        if (iframe && 'contentWindow' in iframe) {
          iframe.contentWindow.postMessage(message, deepscatter_send);
        }
      } else {
        console.error('No data received from the server.');
      }
    } catch (error) {
      console.error("Could not fetch search results:", error);
    }
  };

  useEffect(() => {
    const handleIframeMessage = (event) => {
      if (event.data.type === 'DRAG_OVER_IFRAME') {
        setIsDragging(true);
      } else if (event.data.type === 'DROP_ON_IFRAME') {
        setIsDragging(false);
      } else if (event.data.type === 'NODE_CLICKED') {
        retrieve(event.data.id);
      }
    };

    window.addEventListener('message', handleIframeMessage);

    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [selectedDataset]);

  const renderContent = (item) => {
    const datasetConfig = datasetConfigs[selectedDataset];
    if (datasetConfig.isOnline) {
      return (
        <iframe
          src={generateYouTubeUrl(item)}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Video Player"
        />
      );
    } else {
      const trackUrl = audioSource;
      return (
        <div style={{ width: '100%', alignItems: 'center' }}>
          <AudioPlayer audioSource={trackUrl} />
        </div>
      );
    }
  };

  const generateSongTile = (item, index) => {
    const { title } = item;
    const thumbnailUrl = datasetConfigs[selectedDataset].isOnline ? getYouTubeThumbnail(item, 'max') : undefined;
    return (
      <SongTile
        key={index}
        title={title}
        thumbnailUrl={thumbnailUrl}
        onClick={() => retrieve(item.id)}
      />
    );
  };

  const searchBarStyle = {
    outline: 'none',
    margin: '0 10px',
    color: 'white',
    backgroundColor: 'transparent',
  };

  const topBarStyle = {
    zIndex: 2,
    padding: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
  };

  const searchContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    maxWidth: '500px',
    padding: '6px 8px',
    borderRadius: '15px',
    border: '1px solid white',
  };

  const invisibleSpacerStyle = {
    visibility: 'hidden',
    width: '15%',
  };

  const searchResultsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '700px',
    width: '50%',
    zIndex: 2,
    overflowY: 'auto',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    padding: '10px',
    borderRadius: '20px',
  };

  const sideBarStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    margin: '10px',
    width: '15%',
  };

  const mainResultStyle = {
    width: '100%',
    height: '40vh',
    border: '1px solid gray',
    borderRadius: '10px',
  };

  const additionalResultsStyle = {
    overflowY: 'auto',
    padding: '10px',
    borderRadius: '10px',
  };

  const metadataContainerStyle = {
    padding: '10px',
    color: 'white',
    margin: '10px 0',
    minHeight: '150px',
  };

  if (isMobileDevice) {
    searchResultsContainerStyle.width = '95%';
    mainResultStyle.height = '25vh';
    searchBarStyle.width = '100%';
    sideBarStyle.width = '40%';
    metadataContainerStyle.overflowY = 'auto';
  }

  return (
    <>
      <main style={{
        position: 'fixed',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
        <div
          id="overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: isOverlayVisible ? 'block' : 'none',
            zIndex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        />
        <iframe
          src={iframeSrc}
          id="deepscatterIframe"
          style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: '100%', border: 'none', zIndex: 0 }}
        ></iframe>
        <div style={topBarStyle}>
          {!isMobileDevice && <div style={invisibleSpacerStyle}></div>}
          <div style={searchContainerStyle}>
            <input
              style={{ ...searchBarStyle, flexGrow: 1 }}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search Audio Atlas'
              value={query}
              onKeyDown={handleSearchKeyDown}
            />
            <button onClick={triggerFileInputClick} style={{
              background: 'none',
              scale: '0.9',
              color: 'white',
              border: '1px dashed white',
              borderRadius: '10px',
              cursor: 'pointer',
              padding: '8px 12px',
            }}>
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
          <div style={sideBarStyle}>
            <select onChange={handleDatasetChange} style={{ background: 'transparent', color: 'white', listStyle: 'revert', marginRight: '10px', overflow: 'hidden', width: '70%' }}>
              <option value="fma">FMA</option>
              <option value="jamendo">Jamendo</option>
              <option value="yt8m">YT8M MTC</option>
              <option value="musiccaps">MusicCaps</option>
              <option value="vctk">VCTK</option>
              <option value="ESC50">ESC-50</option>
            </select>
            <button onClick={handleOpenModal} style={{ color: 'white', cursor: 'pointer', scale: '1.2' }}>
              <FontAwesomeIcon icon={faInfoCircle} />
            </button>
          </div>
        </div>
        {searchInitiated && (
          <div style={searchResultsContainerStyle} ref={resultsRef}>
            {urls.length > 0 && (
              renderContent(urls[0])
            )}
            <div style={metadataContainerStyle}>
              {generateMetadataContent()}
            </div>
            <h2 style={{ color: 'white', textAlign: 'center' }}>Most similar according to AI</h2>
            {urls.length > 1 && (
              <div style={additionalResultsStyle}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {urls.slice(1).map((item, index) => (
                    generateSongTile(item, index)
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {!searchInitiated && !isMobileDevice && (
          <div className={`file-drop-container ${isDragging ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}>
            {isLoading && (
              <div className="loading-animation"></div>
            )}
            {!isLoading && (
              <p style={{ color: '#666', fontSize: '16px' }}>
                Drag & Drop your audio file here
              </p>
            )}
            <input
              type="file"
              accept=".mp3,.wav"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
        )}

        <InfoModal isVisible={isModalVisible} onClose={handleCloseModal} />
      </main>
    </>
  );
}