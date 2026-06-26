import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the file-tracing root to this project. Without this, Next can pick up an
  // unrelated lockfile higher in the filesystem and infer the wrong root.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
