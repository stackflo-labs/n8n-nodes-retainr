import type { NextConfig } from "next"
import { withContentlayer } from "next-contentlayer"

const nextConfig: NextConfig = {
  reactCompiler: true,
  pageExtensions: ["ts", "tsx", "mdx"],
  turbopack: {
    resolveAlias: {
      "contentlayer/generated": "./.contentlayer/generated/index.mjs",
      "next-contentlayer/hooks": "./node_modules/next-contentlayer/dist/hooks/index.js",
    },
  },
}

export default withContentlayer(nextConfig)
