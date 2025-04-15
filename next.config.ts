/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb' // Set your desired limit here
    }
  }
}

module.exports = nextConfig