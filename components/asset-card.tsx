import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssetWithCreator } from "@/lib/assets";
import Image from "next/image";
import Link from "next/link";

interface AssetCardProps {
	asset: AssetWithCreator;
}

export function AssetCard({ asset }: AssetCardProps) {
	return (
		<Link href={`/assets/${asset.id}`}>
			<Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group bg-card/50 backdrop-blur-sm h-full flex flex-col">
				<div className="aspect-3/4 relative bg-muted overflow-hidden">
					{/* Asset Image */}
					{asset.preview_images?.[0] ? (
						<Image
							src={asset.preview_images[0]}
							alt={asset.name}
							fill
							className="object-cover group-hover:scale-105 transition-transform duration-500"
						/>
					) : (
						<div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-secondary/20 group-hover:scale-105 transition-transform duration-500" />
					)}
					<div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
						Asset
					</div>
				</div>
				<CardHeader className="p-4 pb-0">
					<CardTitle className="text-lg truncate">{asset.name}</CardTitle>
					<p className="text-sm text-muted-foreground">
						by {asset.creator?.username || "Unknown"}
					</p>
				</CardHeader>
				<CardFooter className="p-4 flex items-center justify-between mt-auto">
					<span className="font-bold text-lg">
						${Number(asset.price).toFixed(2)}
					</span>
					<Button size="sm" variant="secondary" className="rounded-full">
						View
					</Button>
				</CardFooter>
			</Card>
		</Link>
	);
}
