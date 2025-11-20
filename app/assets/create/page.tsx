import { createAsset } from "@/lib/actions/assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function CreateAssetPage() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect("/");
	}

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "400px",
				} as React.CSSProperties
			}
		>
			<Sidebar className="pt-16">
				<SidebarHeader>
					<div className="px-4 py-4">
						<h1 className="text-2xl font-bold tracking-tight">Create Asset</h1>
						<p className="text-sm text-muted-foreground">
							Fill in the details below
						</p>
					</div>
				</SidebarHeader>
				<SidebarContent>
					<form
						action={createAsset}
						id="create-asset-form"
						className="space-y-6 px-4 pb-4"
					>
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
					</form>
				</SidebarContent>
				<SidebarFooter className="p-4">
					<Button type="submit" form="create-asset-form" className="w-full">
						Create Asset (Draft)
					</Button>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 h-4" />
					<span className="font-semibold">Asset Preview</span>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<div className="mx-auto w-full max-w-4xl py-8">
						<Card>
							<CardHeader>
								<CardTitle>Preview</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
									Preview will appear after creation
								</div>
								<p className="text-sm text-muted-foreground mt-4 text-center">
									This is how your asset will look to users.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
