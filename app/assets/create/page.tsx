import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateAssetForm } from "./create-asset-form";

export default async function CreateAssetPage() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
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

	return <CreateAssetForm userProfile={profile} />;
}
