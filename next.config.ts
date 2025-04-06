/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb' // Set your desired limit here
    }
  }
}

module.exports = nextConfig