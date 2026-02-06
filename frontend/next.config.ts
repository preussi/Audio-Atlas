import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['deepscatter'],
  async rewrites() {
    // Proxy /api/* and /data/* requests to the backend server so the browser
    // only needs to reach the frontend's origin (avoids CORS and networking
    // issues when the app is accessed remotely).
    const backendUrl = process.env.BACKEND_URL || 'http://server:8000';
    return [
      { source: '/data/:path*', destination: `${backendUrl}/data/:path*` },
      { source: '/search/:path*', destination: `${backendUrl}/search/:path*` },
      { source: '/retrieve/:path*', destination: `${backendUrl}/retrieve/:path*` },
      { source: '/upload-audio/:path*', destination: `${backendUrl}/upload-audio/:path*` },
    ];
  },
};

export default nextConfig;
