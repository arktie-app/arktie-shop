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

	return NextResponse.json({ message: "Hello World" });
}
