import { createAsset } from "@/lib/actions/assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CreateAssetPage() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect("/");
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold tracking-tight mb-8">
				Create New Asset
			</h1>

			<form
				action={createAsset}
				className="grid grid-cols-1 lg:grid-cols-3 gap-8"
			>
				{/* Left Column: Preview (using placeholder for now as we don't have real-time preview logic yet without client components state) */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Asset Preview</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
								Preview will appear after creation
							</div>
							{/* In a real app, we'd use client state to update this preview live */}
						</CardContent>
					</Card>
				</div>

				{/* Right Column: Edit Form */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Asset Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									name="name"
									placeholder="e.g. Cyberpunk Character Model"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="price">Price (¥)</Label>
								<Input
									id="price"
									name="price"
									type="number"
									min="0"
									step="0.01"
									placeholder="1000"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									name="description"
									placeholder="Describe your asset..."
									className="min-h-[150px]"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="images">Asset Previews</Label>
								<Input
									id="images"
									name="images"
									type="file"
									accept="image/*"
									multiple
									required
								/>
								<p className="text-xs text-muted-foreground">
									Max 5 images, 10MB each. Supported formats: JPG, PNG, GIF.
								</p>
							</div>

							<Button type="submit" className="w-full">
								Create Asset (Draft)
							</Button>
						</CardContent>
					</Card>
				</div>
			</form>
		</div>
	);
}
