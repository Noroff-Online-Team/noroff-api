import createMDX from "fumadocs-mdx/config"

const withMDX = createMDX()

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

export default withMDX(config)
