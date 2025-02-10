/** @type {import('next').NextConfig} */
import type {Configuration} from "webpack"

const nextConfig = {
  images:{
    domains: ['cdn.sanity.io']
  },
  reactStrictMode: true,
  webpack: (config: Configuration, { isServer }: {isServer: boolean}) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs:false 
        },
      };
    }
    return config;
  },
};

export default nextConfig;