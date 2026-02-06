'use client';

interface InfoModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function InfoModal({ isVisible, onClose }: InfoModalProps) {
  if (!isVisible) return null;

  return (
    <div
      style={{
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
      }}
    >
      <div
        style={{
          width: '70%',
          minHeight: '30%',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2>Information</h2>
        <p>
          Audio Atlas is an interactive website for visualizing audio and music datasets.
          We use Milvus DB for storing and retrieving audio embeddings, and visualize the data
          using DeepScatter to efficiently render 2D scatter plots. Audio Atlas was developed in the{' '}
          <a href="https://disco.ethz.ch/" style={{ color: 'blue' }}>DISCO research group</a>{' '}
          at ETH Zurich and is{' '}
          <a href="https://github.com/ETH-DISCO/audio-atlas" style={{ color: 'blue' }}>open-source</a>.
        </p>
        <button onClick={onClose} style={{ alignSelf: 'flex-end', marginTop: 'auto' }}>
          Close
        </button>
      </div>
    </div>
  );
}
