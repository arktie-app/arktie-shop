import { Edit, ExternalLink, MoreVertical, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { AssetWithCreator } from "@/lib/assets";

interface AssetGridProps {
	assets: AssetWithCreator[];
	showCreatePlaceholder?: boolean;
}

export function AssetGrid({
	assets,
	showCreatePlaceholder = false,
}: AssetGridProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
			{assets.map((asset) => (
				<Card
					key={asset.id}
					className="group overflow-hidden transition-all hover:shadow-lg"
				>
					<div className="aspect-video relative bg-muted overflow-hidden">
						{asset.preview_images && asset.preview_images.length > 0 ? (
							<div
								className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
								style={{
									backgroundImage: `url(${asset.preview_images[0]})`,
								}}
							/>
						) : (
							<div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
								No Image
							</div>
						)}
						<div className="absolute top-2 right-2">
							<Button
								variant="secondary"
								size="icon"
								className="h-8 w-8 backdrop-blur-md bg-background/50"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</div>
						<div className="absolute bottom-2 left-2">
							<span
								className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-md ${
									asset.status === "Active"
										? "bg-green-500/20 text-green-500"
										: asset.status === "Draft"
											? "bg-yellow-500/20 text-yellow-500"
											: "bg-gray-500/20 text-gray-500"
								}`}
							>
								{asset.status}
							</span>
						</div>
					</div>
					<CardHeader className="p-4 pb-2">
						<div className="flex justify-between items-start">
							<div>
								<CardTitle className="text-base line-clamp-1">
									{asset.name}
								</CardTitle>
								<p className="text-xs text-muted-foreground mt-1">Asset</p>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-4 pt-0 pb-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Price</span>
							<span className="font-medium">${asset.price.toFixed(2)}</span>
						</div>
						<div className="flex justify-between text-sm mt-1">
							<span className="text-muted-foreground">Sales</span>
							<span className="font-medium">0</span>
						</div>
					</CardContent>
					<CardFooter className="p-4 pt-2 flex gap-2">
						<Button variant="outline" size="sm" className="flex-1">
							<Edit className="mr-2 h-3 w-3" />
							Edit
						</Button>
						<Button variant="outline" size="sm" className="flex-1" asChild>
							<Link href={`/assets/${asset.id}`} target="_blank">
								View Product <ExternalLink className="ml-2 h-3 w-3" />
							</Link>
						</Button>
					</CardFooter>
				</Card>
			))}
			{showCreatePlaceholder && (
				<Button
					variant="outline"
					className="h-full min-h-[300px] flex flex-col gap-4 border-dashed hover:border-primary hover:bg-primary/5"
					asChild
				>
					<Link href="/assets/create">
						<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
							<Plus className="h-6 w-6 text-muted-foreground" />
						</div>
						<span className="font-medium">Create New Asset</span>
					</Link>
				</Button>
			)}
		</div>
	);
}
