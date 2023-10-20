/** @type {import('next').NextConfig} */
const config = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  // For docker
  output: "standalone"
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withContentlayer } = require("next-contentlayer")

module.exports = withContentlayer(config)
