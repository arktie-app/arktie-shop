"use client";

import { createAsset } from "@/lib/actions/assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AssetGallery } from "../[id]/asset-gallery";
import Image from "next/image";
import { useState, useEffect } from "react";

interface CreateAssetFormProps {
	userProfile: {
		username: string;
		avatar_url: string | null;
	};
}

export function CreateAssetForm({ userProfile }: CreateAssetFormProps) {
	const [name, setName] = useState("");
	const [price, setPrice] = useState("");
	const [description, setDescription] = useState("");
	const [images, setImages] = useState<File[]>([]);
	const [previewImages, setPreviewImages] = useState<string[]>([]);

	useEffect(() => {
		const urls = images.map((file) => URL.createObjectURL(file));
		setPreviewImages(urls);
		return () => {
			urls.forEach((url) => {
				URL.revokeObjectURL(url);
			});
		};
	}, [images]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setImages(Array.from(e.target.files));
		}
	};

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "400px",
				} as React.CSSProperties
			}
		>
			<Sidebar className="pt-16">
				<SidebarHeader>
					<div className="px-4 py-4">
						<h1 className="text-2xl font-bold tracking-tight">Create Asset</h1>
						<p className="text-sm text-muted-foreground">
							Fill in the details below
						</p>
					</div>
				</SidebarHeader>
				<SidebarContent>
					<form
						action={createAsset}
						id="create-asset-form"
						className="space-y-6 px-4 pb-4"
					>
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								name="name"
								placeholder="e.g. Cyberpunk Character Model"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="price">Price (¥)</Label>
							<Input
								id="price"
								name="price"
								type="number"
								min="0"
								step="0.01"
								placeholder="1000"
								required
								value={price}
								onChange={(e) => setPrice(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								name="description"
								placeholder="Describe your asset..."
								className="min-h-[150px]"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="images">Asset Previews</Label>
							<Input
								id="images"
								name="images"
								type="file"
								accept="image/*"
								multiple
								required
								onChange={handleImageChange}
							/>
							<p className="text-xs text-muted-foreground">
								Max 5 images, 10MB each. Supported formats: JPG, PNG, GIF.
							</p>
						</div>
					</form>
				</SidebarContent>
				<SidebarFooter className="p-4">
					<Button type="submit" form="create-asset-form" className="w-full">
						Create Asset (Draft)
					</Button>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 h-4" />
					<span className="font-semibold">Asset Preview</span>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<div className="container mx-auto px-4 py-8">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
							{/* Asset Gallery */}
							<div className="px-4 md:px-0">
								{previewImages.length > 0 ? (
									<AssetGallery
										images={previewImages}
										name={name || "Asset Name"}
									/>
								) : (
									<div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
										No images selected
									</div>
								)}
							</div>

							{/* Asset Details */}
							<div className="flex flex-col justify-center space-y-6">
								<div>
									<h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
										{name || "Asset Name"}
									</h1>
									<div className="flex items-center mt-2 space-x-2">
										<p className="text-sm text-muted-foreground">by </p>

										<div className="flex items-center space-x-1">
											{userProfile.avatar_url && (
												<Image
													src={userProfile.avatar_url}
													alt={userProfile.username}
													width={32}
													height={32}
													className="h-8 w-8 rounded-full object-cover"
												/>
											)}
											<span className="text-primary">
												{userProfile.username}
											</span>
										</div>
									</div>

									<p className="mt-4 text-2xl font-bold text-primary">
										¥{price ? Number.parseFloat(price).toFixed(2) : "0.00"}
									</p>
								</div>

								<div>
									<Button
										size="lg"
										className="w-full md:w-auto text-lg px-8"
										disabled
									>
										Buy Now
									</Button>
								</div>

								<div className="space-y-4">
									<p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
										{description || "No description provided."}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
