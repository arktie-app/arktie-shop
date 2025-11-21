import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function BuySuccessPage() {
	return (
		<div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
			<div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full mb-6">
				<CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
			</div>
			<h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
			<p className="text-muted-foreground max-w-md mb-8">
				Thank you for your purchase. You now have access to this asset.
			</p>
			<Link href="/">
				<Button>Back to Assets</Button>
			</Link>
		</div>
	);
}
