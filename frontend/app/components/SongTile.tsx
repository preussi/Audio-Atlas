'use client';

import defaultSongIcon from '../../assets/audio-wave-512.png';

interface SongTileProps {
  onClick: () => void;
  title: string;
  thumbnailUrl?: string;
}

export default function SongTile({ onClick, title, thumbnailUrl }: SongTileProps) {
  let displayTitle = title;
  const shouldAnimate = title.length > 20;
  if (title.length > 40) {
    displayTitle = title.slice(0, 40) + '...';
  }
  const repeatedTitle = shouldAnimate ? `${displayTitle} ---  ${displayTitle}` : displayTitle;

  const isMobile = typeof window !== 'undefined' && /Mobi/i.test(window.navigator.userAgent);
  const size = isMobile ? '130px' : '200px';

  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${thumbnailUrl || defaultSongIcon.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '10px',
        margin: '10px',
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        backdropFilter: 'blur(50px)',
        WebkitBackdropFilter: 'blur(50px)',
      }}
    >
      <div
        style={{
          padding: '10px',
          textAlign: 'left',
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          overflow: 'hidden',
        }}
      >
        <p style={{ color: 'rgba(0,0,0,0.8)', fontSize: '13px', fontWeight: 300, textAlign: 'left', margin: 0 }}>
          Track:
        </p>
        <div
          style={{
            whiteSpace: 'nowrap',
            display: 'inline-block',
            willChange: 'transform',
            animation: shouldAnimate ? 'scrollText 14s linear infinite' : 'none',
          }}
        >
          {repeatedTitle}
        </div>
      </div>
    </div>
  );
}
