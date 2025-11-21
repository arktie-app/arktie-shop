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
