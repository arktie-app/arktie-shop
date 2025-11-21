import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { type Address, getAddress } from "viem";
import { getPaywallHtml } from "x402/paywall";
import { exact } from "x402/schemes";
import {
	findMatchingPaymentRequirements,
	processPriceToAtomicAmount,
	toJsonSafe,
} from "x402/shared";
import {
	type ERC20TokenAmount,
	type FacilitatorConfig,
	type PaymentPayload,
	type Resource,
	SupportedEVMNetworks,
} from "x402/types";
import { useFacilitator } from "x402/verify";
import { getSignedDownloadUrl } from "@/lib/actions/storage";
import { getAsset } from "@/lib/assets";

const facilitatorConfig: FacilitatorConfig = {
	url: "https://www.x402.org/facilitator",
};
const network = "base-sepolia";

export async function GET(
	req: NextRequest,
	ctx: RouteContext<"/assets/[id]/buy">,
) {
	const { verify, settle } = useFacilitator(facilitatorConfig);
	const x402Version = 1;
	const payTo = process.env.NEXT_WALLET_ADDRESS as Address;

	const { id } = await ctx.params;
	const product = await getAsset(id);
	if (!product) {
		return redirect("/");
	}

	const atomicAmountForAsset = processPriceToAtomicAmount(
		product.price.toFixed(2),
		network,
	);
	if ("error" in atomicAmountForAsset) {
		return new NextResponse(atomicAmountForAsset.error, { status: 400 });
	}
	const { maxAmountRequired, asset } = atomicAmountForAsset;
	const resourceUrl =
		`${req.nextUrl.protocol}//${req.nextUrl.host}/assets/${id}` as Resource;

	if (!SupportedEVMNetworks.includes(network)) {
		throw new Error(`Unsupported network: ${network}`);
	}

	const paymentRequirements = [
		{
			scheme: "exact" as const,
			network: network as (typeof SupportedEVMNetworks)[number],
			maxAmountRequired,
			resource: resourceUrl,
			description: product.description ?? "",
			mimeType: "application/json",
			payTo: getAddress(payTo),
			maxTimeoutSeconds: 300,
			asset: getAddress(asset.address),
			outputSchema: {
				input: {
					type: "http",
					method: "GET",
					discoverable: true,
				},
			},
			extra: (asset as ERC20TokenAmount["asset"]).eip712,
		},
	];
	const paymentHeader = req.headers.get("X-PAYMENT");
	if (!paymentHeader) {
		const accept = req.headers.get("Accept");
		if (accept?.includes("text/html")) {
			const userAgent = req.headers.get("User-Agent");
			if (userAgent?.includes("Mozilla")) {
				const parsed = Number(product.price);
				const displayAmount = !Number.isNaN(parsed) ? parsed : Number.NaN;
				const html = getPaywallHtml({
					amount: displayAmount,
					paymentRequirements: toJsonSafe(paymentRequirements) as Parameters<
						typeof getPaywallHtml
					>[0]["paymentRequirements"],
					currentUrl: req.url,
					testnet: network === "base-sepolia",
				});
				return new NextResponse(html, {
					status: 402,
					headers: { "Content-Type": "text/html" },
				});
			}
		}

		return new NextResponse(
			JSON.stringify({
				x402Version,
				error: "X-PAYMENT header is required",
				accepts: paymentRequirements,
			}),
			{ status: 402, headers: { "Content-Type": "application/json" } },
		);
	}

	// Verify payment
	let decodedPayment: PaymentPayload;
	try {
		decodedPayment = exact.evm.decodePayment(paymentHeader);
		decodedPayment.x402Version = x402Version;
	} catch (error) {
		return new NextResponse(
			JSON.stringify({
				x402Version,
				error: error instanceof Error ? error : "Invalid payment",
				accepts: paymentRequirements,
			}),
			{ status: 402, headers: { "Content-Type": "application/json" } },
		);
	}

	const selectedPaymentRequirements = findMatchingPaymentRequirements(
		paymentRequirements,
		decodedPayment,
	);
	if (!selectedPaymentRequirements) {
		return new NextResponse(
			JSON.stringify({
				x402Version,
				error: "Unable to find matching payment requirements",
				accepts: toJsonSafe(paymentRequirements),
			}),
			{ status: 402, headers: { "Content-Type": "application/json" } },
		);
	}

	const verification = await verify(
		decodedPayment,
		selectedPaymentRequirements,
	);

	if (!verification.isValid) {
		return new NextResponse(
			JSON.stringify({
				x402Version,
				error: verification.invalidReason,
				accepts: paymentRequirements,
				payer: verification.payer,
			}),
			{ status: 402, headers: { "Content-Type": "application/json" } },
		);
	}

	try {
		await settle(decodedPayment, selectedPaymentRequirements);
	} catch (error) {
		return new NextResponse(
			JSON.stringify({
				x402Version,
				error: error instanceof Error ? error : "Settlement failed",
				accepts: paymentRequirements,
			}),
			{ status: 402, headers: { "Content-Type": "application/json" } },
		);
	}

	return new NextResponse(
		getDownloadHtml(await getSignedDownloadUrl(product.attachment_path)),
		{
			status: 200,
			headers: { "Content-Type": "text/html" },
		},
	);
}

function getDownloadHtml(url: string): string {
	return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Download Your Asset | Arktie Shop</title><style>:root {--bg-color: #09090b;--card-bg: #18181b;--text-primary: #fafafa;--text-secondary: #a1a1aa;--accent-color: #fff;--danger-bg: rgba(127, 29, 29, 0.2);--danger-border: rgba(185, 28, 28, 0.4);--danger-text: #fca5a5;--border-color: #27272a;}body {margin: 0;padding: 0;font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;background-color: var(--bg-color);color: var(--text-primary);display: flex;align-items: center;justify-content: center;min-height: 100vh;box-sizing: border-box;}.container {background-color: var(--card-bg);border: 1px solid var(--border-color);border-radius: 12px;padding: 2.5rem;max-width: 420px;width: 90%;text-align: center;box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);}h1 {margin-top: 0;font-size: 1.5rem;font-weight: 600;margin-bottom: 0.75rem;letter-spacing: -0.025em;}p {color: var(--text-secondary);line-height: 1.6;margin-bottom: 2rem;font-size: 0.95rem;}.warning-box {background-color: var(--danger-bg);border: 1px solid var(--danger-border);color: var(--danger-text);padding: 1rem;border-radius: 8px;margin-bottom: 2rem;font-size: 0.875rem;text-align: left;}.warning-box strong {display: block;margin-bottom: 0.5rem;color: #fecaca;}.warning-box ul {margin: 0;padding-left: 1.25rem;}.warning-box li {margin-bottom: 0.25rem;}.warning-box li:last-child {margin-bottom: 0;}.btn {display: flex;align-items: center;justify-content: center;background-color: var(--accent-color);color: var(--bg-color);padding: 0.75rem 1.5rem;border-radius: 6px;text-decoration: none;font-weight: 600;transition: all 0.2s ease;width: 100%;box-sizing: border-box;font-size: 1rem;}.btn:hover {opacity: 0.9;transform: translateY(-1px);}.btn:active {transform: translateY(0);}.footer {margin-top: 2rem;font-size: 0.75rem;color: var(--text-secondary);opacity: 0.6;}/* Icon styles */.icon {width: 20px;height: 20px;margin-right: 8px;fill: currentColor;}</style></head><body><div class="container"><h1>Ready to Download</h1><p>Thank you for your purchase. Your asset is ready to be downloaded.</p><div class="warning-box"><strong>⚠️ Important Notice</strong><ul><li>This page can only be accessed once.</li><li>The download link will expire in 24 hours.</li></ul></div><a href="${url}" class="btn"><svg class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 16L7 11H10V4H14V11H17L12 16ZM6 18V20H18V18H6Z"/></svg>Download Now</a><div class="footer">&copy; ${new Date().getFullYear()} Arktie Shop. All rights reserved.</div></div></body></html>`;
}
