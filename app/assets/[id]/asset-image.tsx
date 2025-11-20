"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AssetImageProps {
	src: string;
	alt: string;
	className?: string;
}

export function AssetImage({ src, alt, className }: AssetImageProps) {
	const [isLoading, setIsLoading] = useState(true);

	return (
		<div
			className={cn(
				"relative aspect-square overflow-hidden rounded-lg bg-muted",
				className,
			)}
		>
			<Image
				src={src}
				alt={alt}
				fill
				className={cn(
					"object-cover transition-all duration-300",
					isLoading
						? "scale-110 blur-2xl grayscale"
						: "scale-100 blur-0 grayscale-0",
				)}
				onLoad={() => setIsLoading(false)}
			/>
		</div>
	);
}
