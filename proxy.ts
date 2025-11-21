import type { Address } from "viem";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { paymentMiddleware } from "x402-next";

export async function proxy(request: NextRequest) {
	const payTo = process.env.NEXT_WALLE_ADDRESS as Address;

	// Only run payment middleware on the buy route
	if (request.nextUrl.pathname.includes("/protected")) {
		const mw = paymentMiddleware(
			payTo,
			{
				"/protected": {
					price: "$0.01",
					network: "base-sepolia",
					config: {
						description: "Access to protected content",
					},
				},
			},
			{
				url: "https://x402.org/facilitator",
			},
		);

		return await mw(request);
	}

	return await updateSession(request);
}
