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
import {
	ImageCrop,
	ImageCropApply,
	ImageCropContent,
	ImageCropReset,
} from "@/components/ui/shadcn-io/image-crop";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface AssetFormProps {
	userProfile: {
		username: string;
		avatar_url: string | null;
	};
	initialData?: AssetWithCreator;
	assetId?: string;
}

// Helper type to manage mixed images (existing URLs and new Files)
type ImageItem =
	| { type: "url"; url: string; id: string }
	| { type: "file"; file: File; previewUrl: string; id: string };

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

	// State for managing images
	const [images, setImages] = useState<ImageItem[]>(() => {
		if (initialData?.preview_images) {
			return initialData.preview_images.map((url) => ({
				type: "url",
				url,
				id: `url-${url}`, // Simple unique ID for existing URLs
			}));
		}
		return [];
	});

	const [attachment, setAttachment] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	// Cropper state
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);

	// Cleanup object URLs on unmount
	useEffect(() => {
		return () => {
			images.forEach((img) => {
				if (img.type === "file") {
					URL.revokeObjectURL(img.previewUrl);
				}
			});
		};
		// We intentionally omit 'images' from dependency array to only run on unmount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			setAttachment(e.target.files[0]);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			setSelectedFile(e.target.files[0]);
			setIsCropDialogOpen(true);
			// Reset input value so same file can be selected again if needed
			e.target.value = "";
		}
	};

	const handleCropComplete = async (croppedImageUrl: string) => {
		// Convert blob URL to File object
		try {
			const response = await fetch(croppedImageUrl);
			const blob = await response.blob();
			const file = new File([blob], selectedFile?.name || "image.png", {
				type: "image/png",
			});

			// Create a persistent preview URL for our list
			const previewUrl = URL.createObjectURL(file);
			const id = `file-${Date.now()}-${Math.random()}`;

			setImages((prev) => [...prev, { type: "file", file, previewUrl, id }]);
			setIsCropDialogOpen(false);
			setSelectedFile(null);
		} catch (error) {
			console.error("Error processing cropped image:", error);
		}
	};

	const removeImage = (index: number) => {
		setImages((prev) => {
			const newImages = [...prev];
			const removed = newImages.splice(index, 1)[0];
			if (removed.type === "file") {
				URL.revokeObjectURL(removed.previewUrl);
			}
			return newImages;
		});
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

			// Handle images
			const existingUrls = images
				.filter(
					(img): img is { type: "url"; url: string; id: string } =>
						img.type === "url",
				)
				.map((img) => img.url);

			formData.append("existing_images", JSON.stringify(existingUrls));

			const newFiles = images
				.filter(
					(
						img,
					): img is {
						type: "file";
						file: File;
						previewUrl: string;
						id: string;
					} => img.type === "file",
				)
				.map((img) => img.file);

			newFiles.forEach((file) => {
				formData.append("images", file);
			});

			formData.append("attachment_path", attachmentPath);

			if (assetId) {
				formData.append("id", assetId);
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

	// Prepare preview images for the gallery (strings only)
	const galleryPreviewImages = images.map((img) =>
		img.type === "url" ? img.url : img.previewUrl,
	);

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
							<Label>Asset Previews</Label>
							<div className="grid grid-cols-3 gap-2 mb-2">
								{images.map((img, index) => (
									<div
										key={img.id}
										className="relative aspect-square group rounded-md overflow-hidden border bg-muted"
									>
										<Image
											src={img.type === "url" ? img.url : img.previewUrl}
											alt={`Preview ${index + 1}`}
											fill
											className="object-cover"
										/>
										<button
											type="button"
											onClick={() => removeImage(index)}
											className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
										>
											<X className="h-3 w-3" />
										</button>
									</div>
								))}
								<Dialog
									open={isCropDialogOpen}
									onOpenChange={setIsCropDialogOpen}
								>
									<DialogTrigger asChild>
										<button
											type="button"
											className="aspect-square border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors w-full"
											onClick={() =>
												document.getElementById("image-upload-trigger")?.click()
											}
										>
											<Plus className="h-6 w-6 text-muted-foreground mb-1" />
											<span className="text-xs text-muted-foreground">Add</span>
										</button>
									</DialogTrigger>
									<DialogContent className="sm:max-w-[600px]">
										<DialogHeader>
											<DialogTitle>Crop Image</DialogTitle>
										</DialogHeader>
										<div className="py-4">
											{selectedFile && (
												<ImageCrop
													file={selectedFile}
													aspect={1}
													onCrop={handleCropComplete}
												>
													<div className="flex flex-col items-center gap-4">
														<ImageCropContent />
														<div className="flex gap-2">
															<ImageCropReset />
															<ImageCropApply>Crop & Add</ImageCropApply>
														</div>
													</div>
												</ImageCrop>
											)}
										</div>
									</DialogContent>
								</Dialog>
								{/* Hidden input for file selection */}
								<Input
									id="image-upload-trigger"
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleFileSelect}
								/>
							</div>
							<p className="text-xs text-muted-foreground">
								Max 5 images. Supported formats: JPG, PNG, GIF.
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
								{galleryPreviewImages.length > 0 ? (
									<AssetGallery
										images={galleryPreviewImages}
										name={name || "Asset Name"}
									/>
								) : (
									<div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
										<div className="flex flex-col items-center gap-2">
											<ImageIcon className="h-12 w-12 text-muted-foreground/50" />
											<span className="text-sm text-muted-foreground">
												No images selected
											</span>
										</div>
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
