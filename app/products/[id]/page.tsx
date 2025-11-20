import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/mock-data";
import { ProductGallery } from "./product-gallery";

interface ProductPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function ProductPage({ params }: ProductPageProps) {
	const { id } = await params;
	const product = products.find((p) => p.id === id);

	if (!product) {
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
					Back to Products
				</Link>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
				{/* Product Gallery */}
				<div className="px-4 md:px-0">
					<ProductGallery images={product.images} name={product.name} />
				</div>

				{/* Product Details */}
				<div className="flex flex-col justify-center space-y-6">
					<div>
						<h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
							{product.name}
						</h1>
						<div className="flex items-center mt-2 space-x-2">
							{product.creator.avatar && (
								<Image
									src={product.creator.avatar}
									alt={product.creator.username}
									className="h-8 w-8 rounded-full object-cover"
								/>
							)}
							<p className="text-sm text-muted-foreground">
								by{" "}
								<Link
									href={`/users/@${product.creator.username}`}
									className="text-primary hover:underline"
								>
									{product.creator.username}
								</Link>
							</p>
						</div>

						<p className="mt-4 text-2xl font-bold text-primary">
							${product.price.toLocaleString()}
						</p>
					</div>

					<div>
						<Button size="lg" className="w-full md:w-auto text-lg px-8">
							Buy Now
						</Button>
					</div>

					<div className="space-y-4">
						<p className="text-base text-muted-foreground leading-relaxed">
							{product.description}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
