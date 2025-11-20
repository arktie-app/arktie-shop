import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export type AssetWithCreator = Database["public"]["Tables"]["assets"]["Row"] & {
	creator: {
		username: string;
		avatar_url: string | null;
	};
};

export async function getAssets(): Promise<AssetWithCreator[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("assets")
		.select(`
      *,
      creator:profiles(username, avatar_url)
    `)
		.eq("status", "Active")
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching assets:", error);
		return [];
	}

	return data as unknown as AssetWithCreator[];
}

export async function getUserAssets(
	userId: string,
): Promise<AssetWithCreator[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("assets")
		.select(`
      *,
      creator:profiles(username, avatar_url)
    `)
		.eq("creator_id", userId)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching user assets:", error);
		return [];
	}

	return data as unknown as AssetWithCreator[];
}

export async function getAsset(id: string): Promise<AssetWithCreator | null> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("assets")
		.select(`
      *,
      creator:profiles(username, avatar_url)
    `)
		.eq("id", id)
		.single();

	if (error) {
		console.error("Error fetching asset:", error);
		return null;
	}

	return data as unknown as AssetWithCreator;
}
