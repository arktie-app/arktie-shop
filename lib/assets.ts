import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export type AssetWithCreator = Database["public"]["Tables"]["assets"]["Row"] & {
	creator: {
		username: string;
		avatar_url: string | null;
	};
};

export async function getAssets(
	page = 1,
	limit = 8,
): Promise<{ assets: AssetWithCreator[]; total: number }> {
	const supabase = await createClient();
	const from = (page - 1) * limit;
	const to = from + limit - 1;

	const { data, error, count } = await supabase
		.from("assets")
		.select(
			`
      *,
      creator:profiles(username, avatar_url)
    `,
			{ count: "exact" },
		)
		.eq("status", "Active")
		.order("created_at", { ascending: false })
		.range(from, to);

	if (error) {
		console.error("Error fetching assets:", error);
		return { assets: [], total: 0 };
	}

	return { assets: data as unknown as AssetWithCreator[], total: count || 0 };
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
