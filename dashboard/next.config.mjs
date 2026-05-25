import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';



const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: false });

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.discordapp.com",
            },
            {
                protocol: "https",
                hostname: "media.giphy.com",
            },
            {
                protocol: "https",
                hostname: "c.tenor.com",
            },
            {
                protocol: "https",
                hostname: "media.tenor.com",
            },
            {
                protocol: "https",
                hostname: "tenor.com",
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
