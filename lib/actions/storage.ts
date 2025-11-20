"use server";

import { createClient } from "@/lib/supabase/server";

export async function getSignedUploadToken(fileName: string) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("User not authenticated");
	}

	const fileExt = fileName.split(".").pop();
	const path = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

	const { data, error } = await supabase.storage
		.from("asset_attachments")
		.createSignedUploadUrl(path);

	if (error) {
		console.error("Error creating signed upload URL:", error);
		throw new Error("Failed to create upload URL");
	}

	return {
		signedUrl: data.signedUrl,
		path: data.path,
		token: data.token,
	};
}
