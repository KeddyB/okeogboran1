/** @type {import('next').NextConfig} */
import type {Configuration} from "webpack"

const nextConfig = {
  images:{
    domains: ['cdn.sanity.io', "lh3.googleusercontent.com", 'api.mux.com']
  },
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Allow CORS for Flutterwave domains
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://checkout-v3-ui-prod.f4b-flutterwave.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://checkout-v2.dev-flutterwave.com",
          },
        ],
      },
    ]
  },
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