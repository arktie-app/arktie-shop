import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAsset } from "@/lib/assets";
import { AssetGallery } from "./asset-gallery";

interface AssetPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function AssetPage({ params }: AssetPageProps) {
	const { id } = await params;
	const asset = await getAsset(id);

	if (!asset) {
		notFound();
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<Link
					href="/"
					className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Assets
				</Link>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
				{/* Asset Gallery */}
				<div className="px-4 md:px-0">
					<AssetGallery images={asset.preview_images} name={asset.name} />
				</div>

				{/* Asset Details */}
				<div className="flex flex-col justify-center space-y-6">
					<div>
						<h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
							{asset.name}
						</h1>
						<div className="flex items-center mt-2 space-x-2">
							<p className="text-sm text-muted-foreground">by </p>

							<div className="flex items-center space-x-1">
								{asset.creator.avatar_url && (
									<Image
										src={asset.creator.avatar_url}
										alt={asset.creator.username}
										width={32}
										height={32}
										className="h-8 w-8 rounded-full object-cover"
									/>
								)}
								<Link
									href={`/users/@${asset.creator.username}`}
									className="text-primary hover:underline"
								>
									{asset.creator.username}
								</Link>
							</div>
						</div>

						<p className="mt-4 text-2xl font-bold text-primary">
							${asset.price.toFixed(2)}
						</p>
					</div>

					<div>
						<Link href={`/assets/${id}/buy`}>
							<Button size="lg" className="w-full md:w-auto text-lg px-8">
								Buy Now
							</Button>
						</Link>
					</div>

					<div className="space-y-4">
						<p className="text-base text-muted-foreground leading-relaxed">
							{asset.description}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
