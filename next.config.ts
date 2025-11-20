import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		dangerouslyAllowLocalIP: true,
		remotePatterns: [new URL("http://127.0.0.1:54321/storage/**")],
	},
};

export default nextConfig;
