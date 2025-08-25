/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: [
        process.env.NEXT_PUBLIC_TAILSCALE_HOST
    ]
};

export default nextConfig;