/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.s3.us-east-2.amazonaws.com',
            },
            {
                protocol: 'https',
                hostname: 'media.bitstudio.ai',
            }
        ],
    },
};

module.exports = nextConfig; 