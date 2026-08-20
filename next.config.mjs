import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/payroll',
        permanent: true,
      },
    ];
  },
  webpack(config, { isServer }) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias['isomorphic-ws'] = path.resolve(__dirname, 'dummy-ws.js');
    
    return config;
  },
};

export default nextConfig;
