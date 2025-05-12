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
                hostname: 'cdn.klingai.com',
            }
        ],
    },
};

module.exports = nextConfig; 