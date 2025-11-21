import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssetForm } from "../../_components/asset-form";
import { getAsset } from "@/lib/assets";

interface EditAssetPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function EditAssetPage({ params }: EditAssetPageProps) {
	const { id } = await params;
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect("/");
	}

	const asset = await getAsset(id);

	if (!asset) {
		return redirect("/dashboard");
	}

	if (asset.creator_id !== user.id) {
		return redirect("/");
	}

	const { data: profile } = await supabase
		.from("profiles")
		.select("username, avatar_url")
		.eq("id", user.id)
		.single();

	if (!profile) {
		return redirect("/");
	}

	return (
		<AssetForm userProfile={profile} initialData={asset} assetId={asset.id} />
	);
}
