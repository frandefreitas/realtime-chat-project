/** drop-in: se ainda não tiver, inclua o rewrite de /uploads **/
/** @type {import('next').NextConfig} */
const isDocker = process.env.NEXT_PUBLIC_DOCKER === '1' || process.env.DOCKER === '1';
const target = isDocker ? 'http://backend:4000' : 'http://localhost:4000';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/api/:path*',       destination: `${target}/api/:path*` },
      { source: '/socket.io/:path*', destination: `${target}/socket.io/:path*` },
      { source: '/uploads/:path*',   destination: `${target}/uploads/:path*` },
    ];
  },
};
module.exports = nextConfig;
