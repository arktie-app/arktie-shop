"use client";

import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductImageProps {
	src: string;
	alt: string;
}

export function ProductImage({ src, alt }: ProductImageProps) {
	const [isLoading, setIsLoading] = useState(true);

	return (
		<div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
			{isLoading && <Skeleton className="absolute inset-0 h-full w-full" />}
			<Image
				src={src}
				alt={alt}
				fill
				className={cn(
					"object-cover transition-transform hover:scale-105",
					isLoading ? "opacity-0" : "opacity-100",
				)}
				onLoad={() => setIsLoading(false)}
				priority
			/>
		</div>
	);
}
