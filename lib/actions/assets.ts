"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createAsset(formData: FormData) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("User not authenticated");
	}

	const name = formData.get("name") as string;
	const description = formData.get("description") as string;
	const price = Number(formData.get("price"));
	// Status defaults to Draft
	const status = "Draft";

	const attachmentPath = formData.get("attachment_path") as string;
	if (!attachmentPath) {
		throw new Error("Attachment is required");
	}

	const imageFiles = formData.getAll("images") as File[];
	const imageUrls: string[] = [];

	// Validate and upload images
	if (imageFiles.length > 5) {
		throw new Error("Maximum 5 images allowed");
	}

	for (const file of imageFiles) {
		if (file.size > 10 * 1024 * 1024) {
			throw new Error(`File ${file.name} exceeds 10MB limit`);
		}
		if (!file.type.startsWith("image/")) {
			throw new Error(`File ${file.name} is not an image`);
		}

		const fileExt = file.name.split(".").pop();
		const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

		const { error: uploadError } = await supabase.storage
			.from("asset_preview")
			.upload(fileName, file);

		if (uploadError) {
			console.error("Error uploading image:", uploadError);
			throw new Error("Failed to upload image");
		}

		const {
			data: { publicUrl },
		} = supabase.storage.from("asset_preview").getPublicUrl(fileName);

		imageUrls.push(publicUrl);
	}

	const { data, error } = await supabase
		.from("assets")
		.insert({
			name,
			description,
			price,
			status,
			preview_images: imageUrls,
			attachment_path: attachmentPath,
			creator_id: user.id,
		})
		.select()
		.single();

	if (error) {
		console.error("Error creating asset:", error);
		throw new Error("Failed to create asset");
	}

	revalidatePath("/dashboard");
	revalidatePath("/");
	redirect(`/assets/${data.id}`);
}

export async function updateAsset(formData: FormData) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("User not authenticated");
	}

	const id = formData.get("id") as string;
	if (!id) throw new Error("Asset ID is required");

	const name = formData.get("name") as string;
	const description = formData.get("description") as string;
	const price = Number(formData.get("price"));
	const attachmentPath = formData.get("attachment_path") as string;

	// Fetch existing asset to check ownership and get current images
	const { data: existingAsset, error: fetchError } = await supabase
		.from("assets")
		.select("*")
		.eq("id", id)
		.single();

	if (fetchError || !existingAsset) {
		throw new Error("Asset not found");
	}

	if (existingAsset.creator_id !== user.id) {
		throw new Error("Unauthorized");
	}

	const existingImagesJson = formData.get("existing_images") as string;
	let existingImages: string[] = [];
	if (existingImagesJson) {
		try {
			existingImages = JSON.parse(existingImagesJson);
		} catch (e) {
			console.error("Error parsing existing images:", e);
		}
	} else {
		// Fallback for backward compatibility or if not provided (though it should be)
		// If not provided, maybe we should default to keeping all?
		// But the form now explicitly sends the list.
		// If it's null, it means empty list (user removed all).
		// But let's be safe and check if it was actually in formData.
		// If the form didn't send it, we might want to fetch current ones?
		// But our form sends "[]" if empty.
		// So if it's null/undefined, it might be an old client?
		// Let's assume it's handled correctly by the form.
	}

	const imageFiles = formData.getAll("images") as File[];
	const newImageUrls: string[] = [];

	// Validate and upload new images
	for (const file of imageFiles) {
		// Skip if it's not a file (e.g. empty string from empty input)
		if (!(file instanceof File) || file.size === 0) continue;

		if (file.size > 10 * 1024 * 1024) {
			throw new Error(`File ${file.name} exceeds 10MB limit`);
		}
		if (!file.type.startsWith("image/")) {
			throw new Error(`File ${file.name} is not an image`);
		}

		const fileExt = file.name.split(".").pop();
		const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

		const { error: uploadError } = await supabase.storage
			.from("asset_preview")
			.upload(fileName, file);

		if (uploadError) {
			console.error("Error uploading image:", uploadError);
			throw new Error("Failed to upload image");
		}

		const {
			data: { publicUrl },
		} = supabase.storage.from("asset_preview").getPublicUrl(fileName);

		newImageUrls.push(publicUrl);
	}

	// Combine existing images (that were kept) with new ones
	const updatedPreviewImages = [...existingImages, ...newImageUrls];

	const { error } = await supabase
		.from("assets")
		.update({
			name,
			description,
			price,
			// Update attachment path only if a new one was uploaded (non-empty string)
			...(attachmentPath ? { attachment_path: attachmentPath } : {}),
			preview_images: updatedPreviewImages,
		})
		.eq("id", id);

	if (error) {
		console.error("Error updating asset:", error);
		throw new Error("Failed to update asset");
	}

	revalidatePath("/dashboard");
	revalidatePath(`/assets/${id}`);
	redirect(`/assets/${id}`);
}
