import { AssetCard } from "@/components/asset-card";
import { Button } from "@/components/ui/button";
import { getAssets } from "@/lib/assets";
import Link from "next/link";

export const metadata = {
	title: "Browse Assets - Arktie Shop",
	description: "Explore our collection of anime digital assets.",
};

interface AssetsPageProps {
	searchParams: Promise<{
		page?: string;
	}>;
}

export default async function AssetsPage({ searchParams }: AssetsPageProps) {
	const params = await searchParams;
	const page = Number(params.page) || 1;
	const limit = 12;
	const { assets, total } = await getAssets(page, limit);
	const totalPages = Math.ceil(total / limit);

	return (
		<div className="flex min-h-screen flex-col">
			<main className="flex-1 container mx-auto px-4 py-8">
				<div className="flex flex-col gap-2 mb-8">
					<h1 className="text-3xl font-bold tracking-tight">Browse Assets</h1>
					<p className="text-muted-foreground">
						Explore our collection of high-quality digital assets.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
					{assets.map((asset) => (
						<AssetCard key={asset.id} asset={asset} />
					))}
					{assets.length === 0 && (
						<div className="col-span-full text-center text-muted-foreground py-12">
							No assets found.
						</div>
					)}
				</div>

				{totalPages > 1 && (
					<div className="flex justify-center gap-2">
						<Button variant="outline" disabled={page <= 1} asChild={page > 1}>
							{page > 1 ? (
								<Link href={`/assets?page=${page - 1}`}>Previous</Link>
							) : (
								"Previous"
							)}
						</Button>
						<div className="flex items-center px-4 text-sm font-medium">
							Page {page} of {totalPages}
						</div>
						<Button
							variant="outline"
							disabled={page >= totalPages}
							asChild={page < totalPages}
						>
							{page < totalPages ? (
								<Link href={`/assets?page=${page + 1}`}>Next</Link>
							) : (
								"Next"
							)}
						</Button>
					</div>
				)}
			</main>
		</div>
	);
}
