"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/supabase";

type AssetStatus = Database["public"]["Enums"]["asset_status"];

export async function updateAssetStatus(assetId: string, status: AssetStatus) {
	const supabase = await createClient();

	const { error } = await supabase
		.from("assets")
		.update({ status })
		.eq("id", assetId);

	if (error) {
		throw new Error(`Failed to update asset status: ${error.message}`);
	}

	revalidatePath("/dashboard");
}

export async function deleteAsset(assetId: string) {
	const supabase = await createClient();

	const { error } = await supabase.from("assets").delete().eq("id", assetId);

	if (error) {
		throw new Error(`Failed to delete asset: ${error.message}`);
	}

	revalidatePath("/dashboard");
}

export async function duplicateAsset(assetId: string) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("User not authenticated");
	}

	// 1. Fetch original asset
	const { data: originalAsset, error: fetchError } = await supabase
		.from("assets")
		.select("*")
		.eq("id", assetId)
		.single();

	if (fetchError || !originalAsset) {
		throw new Error("Failed to fetch original asset");
	}

	// 2. Copy attachment
	const originalAttachmentPath = originalAsset.attachment_path;
	const attachmentExt = originalAttachmentPath.split(".").pop();
	const newAttachmentPath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${attachmentExt}`;

	const { error: attachmentCopyError } = await supabase.storage
		.from("asset_attachments")
		.copy(originalAttachmentPath, newAttachmentPath);

	if (attachmentCopyError) {
		throw new Error(
			`Failed to copy attachment: ${attachmentCopyError.message}`,
		);
	}

	// 3. Copy preview images
	const newPreviewImages: string[] = [];
	if (originalAsset.preview_images && originalAsset.preview_images.length > 0) {
		for (const url of originalAsset.preview_images) {
			// Extract path from URL
			const pathMatch = url.match(/asset_preview\/(.*)/);
			if (pathMatch) {
				const originalPath = pathMatch[1];
				const ext = originalPath.split(".").pop();
				const newPath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

				const { error: imageCopyError } = await supabase.storage
					.from("asset_preview")
					.copy(originalPath, newPath);

				if (imageCopyError) {
					console.error("Failed to copy image:", imageCopyError);
					// Continue with other images even if one fails
				} else {
					const {
						data: { publicUrl },
					} = supabase.storage.from("asset_preview").getPublicUrl(newPath);
					newPreviewImages.push(publicUrl);
				}
			}
		}
	}

	// 4. Create new asset
	const { error: insertError } = await supabase.from("assets").insert({
		name: `${originalAsset.name} (Copy)`,
		description: originalAsset.description,
		price: originalAsset.price,
		status: "Draft",
		preview_images: newPreviewImages,
		attachment_path: newAttachmentPath,
		creator_id: user.id,
	});

	if (insertError) {
		throw new Error(
			`Failed to create duplicated asset: ${insertError.message}`,
		);
	}

	revalidatePath("/dashboard");
}
