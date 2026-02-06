'use client';

import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  audioSource: string;
}

export default function AudioPlayer({ audioSource }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audioSource) {
      audio.pause();
      audio.load();
    }
  }, [audioSource]);

  return (
    <audio controls style={{ width: '100%' }} ref={audioRef}>
      <source src={audioSource} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}
