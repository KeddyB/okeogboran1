/** @type {import('next').NextConfig} */
import type {Confiuration} from "webpack"

const nextConfig = {
  reactStrictMode: true,
  webpack: (config: Configuration, { isServer }: {isServer: boolean}) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: require.resolve('process/browser'),
      };
    }
    return config;
  },
};

export default nextConfig;