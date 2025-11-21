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
