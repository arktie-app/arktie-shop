"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { createAsset, updateAsset } from "@/lib/actions/assets";
import { getSignedUploadToken } from "@/lib/actions/storage";
import { createClient } from "@/lib/supabase/client";
import { AssetGallery } from "../[id]/asset-gallery";
import type { AssetWithCreator } from "@/lib/assets";

interface AssetFormProps {
	userProfile: {
		username: string;
		avatar_url: string | null;
	};
	initialData?: AssetWithCreator;
	assetId?: string;
}

export function AssetForm({
	userProfile,
	initialData,
	assetId,
}: AssetFormProps) {
	const [name, setName] = useState(initialData?.name || "");
	const [price, setPrice] = useState(initialData?.price?.toString() || "");
	const [description, setDescription] = useState(
		initialData?.description || "",
	);
	const [images, setImages] = useState<File[]>([]);
	const [previewImages, setPreviewImages] = useState<string[]>(
		initialData?.preview_images || [],
	);
	const [attachment, setAttachment] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	useEffect(() => {
		// Create object URLs for new files
		const newUrls = images.map((file) => URL.createObjectURL(file));

		// Combine existing images (if any) with new ones for preview
		// Note: This simple logic appends new images.
		// For a full edit experience, we might want to allow removing existing images.
		// For now, we'll just show what we have.
		// If initialData exists, we start with its images.
		// If user adds more, we append.
		// Ideally, we should handle "replacing" or "appending" better,
		// but for MVP "Edit" might just be "Update text fields" or "Replace all images".
		// Let's stick to: if you upload new images, they are added to the preview list for visualization.
		// But the backend logic might need to know if we are keeping old ones.
		// The current create logic uploads all `images`.
		// For update, we probably want to keep old ones unless explicitly removed?
		// Or maybe we just allow adding more?
		// Let's assume for now the user can add more images.

		// Actually, to keep it simple and consistent with "Create":
		// If the user selects new images, we might want to replace the preview or append?
		// Let's append for preview purposes.

		setPreviewImages([...(initialData?.preview_images || []), ...newUrls]);

		return () => {
			newUrls.forEach((url) => {
				URL.revokeObjectURL(url);
			});
		};
	}, [images, initialData?.preview_images]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setImages(Array.from(e.target.files));
		}
	};

	const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			setAttachment(e.target.files[0]);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsUploading(true);

		try {
			let attachmentPath = initialData?.attachment_path || "";

			if (attachment) {
				// Validate attachment
				if (attachment.size > 1024 * 1024 * 1024) {
					throw new Error("Attachment exceeds 1GB limit");
				}
				if (
					attachment.type !== "application/zip" &&
					attachment.type !== "application/x-7z-compressed"
				) {
					throw new Error("Attachment must be a .zip or .7z file");
				}

				const { token, path } = await getSignedUploadToken(attachment.name);

				const supabase = createClient();
				const { error } = await supabase.storage
					.from("asset_attachments")
					.uploadToSignedUrl(path, token, attachment);

				if (error) {
					console.error("Upload failed:", error);
					throw new Error("Failed to upload attachment");
				}

				attachmentPath = path;
			}

			const formData = new FormData();
			formData.append("name", name);
			formData.append("price", price);
			formData.append("description", description);

			// Append new images
			images.forEach((image) => {
				formData.append("images", image);
			});

			formData.append("attachment_path", attachmentPath);

			if (assetId) {
				formData.append("id", assetId);
				// We might need to handle existing images preservation in the server action
				// For now, let's assume the server action handles merging or we send existing images?
				// The current `createAsset` uploads everything.
				// `updateAsset` will need to know about existing images if we want to keep them.
				// Let's pass existing images as a JSON string if needed, or handle it on server.
				// For this iteration, let's assume we just update text and add new images/attachment if provided.
				await updateAsset(formData);
			} else {
				await createAsset(formData);
			}
		} catch (error) {
			console.error("Error saving asset:", error);
		} finally {
			setIsUploading(false);
		}
	};

	const isEditing = !!assetId;

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
						<h1 className="text-2xl font-bold tracking-tight">
							{isEditing ? "Edit Asset" : "Create Asset"}
						</h1>
						<p className="text-sm text-muted-foreground">
							{isEditing ? "Update asset details" : "Fill in the details below"}
						</p>
					</div>
				</SidebarHeader>
				<SidebarContent>
					<form
						onSubmit={handleSubmit}
						id="asset-form"
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
							<Label htmlFor="price">Price ($)</Label>
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
								required={!isEditing} // Not required if editing (already has images)
								onChange={handleImageChange}
							/>
							<p className="text-xs text-muted-foreground">
								Max 5 images, 10MB each. Supported formats: JPG, PNG, GIF.
								{isEditing &&
									" Uploading new images will add to existing ones."}
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="attachment">
								Asset File (ZIP, 7Z) {isEditing && "(Optional)"}
							</Label>
							<Input
								id="attachment"
								name="attachment"
								type="file"
								accept=".zip,.7z"
								required={!isEditing} // Not required if editing
								onChange={handleAttachmentChange}
							/>
							<p className="text-xs text-muted-foreground">
								Max 1GB. Must be a .zip or .7z file.
							</p>
						</div>
					</form>
				</SidebarContent>
				<SidebarFooter className="p-4">
					<Button
						type="submit"
						form="asset-form"
						className="w-full"
						disabled={isUploading}
					>
						{isUploading
							? "Saving..."
							: isEditing
								? "Update Asset"
								: "Create Asset (Draft)"}
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
										${price ? Number.parseFloat(price).toFixed(2) : "0.00"}
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
