import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
		remotePatterns: [
			new URL("http://127.0.0.1:54321/storage/**"),
			new URL("https://lmgeyzjwzlzmnyebbocc.supabase.co/storage/**"),
		],
	},
	experimental: {
		serverActions: {
			bodySizeLimit: "10mb",
		},
	},
};

export default nextConfig;
