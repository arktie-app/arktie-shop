"use client";

import Image from "next/image";
import * as React from "react";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { AssetImage } from "./asset-image";

interface AssetGalleryProps {
	images: string[];
	name: string;
}

export function AssetGallery({ images, name }: AssetGalleryProps) {
	const [api, setApi] = React.useState<CarouselApi>();
	const [current, setCurrent] = React.useState(0);

	React.useEffect(() => {
		if (!api) {
			return;
		}

		setCurrent(api.selectedScrollSnap());

		api.on("select", () => {
			setCurrent(api.selectedScrollSnap());
		});
	}, [api]);

	const onThumbClick = (index: number) => {
		if (!api) return;
		api.scrollTo(index);
	};

	return (
		<div className="flex flex-col gap-4 w-full max-w-xl mx-auto">
			<Carousel setApi={setApi} className="w-full">
				<CarouselContent>
					{images.map((image, index) => (
						<CarouselItem key={image}>
							<AssetImage src={image} alt={`${name} - Image ${index + 1}`} />
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>

			{/* Thumbnails */}
			<div className="flex gap-2 overflow-x-auto pb-2 px-1">
				{images.map((image, index) => (
					<button
						key={image}
						type="button"
						onClick={() => onThumbClick(index)}
						className={cn(
							"relative shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all",
							current === index
								? "border-primary ring-2 ring-primary/30"
								: "border-transparent hover:border-muted-foreground/50",
						)}
					>
						<Image
							src={image}
							alt={`${name} thumbnail ${index + 1}`}
							fill
							className="object-cover"
						/>
					</button>
				))}
			</div>
		</div>
	);
}
