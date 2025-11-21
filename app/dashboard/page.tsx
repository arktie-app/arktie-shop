import { Download, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserAssets } from "@/lib/assets";
import { createClient } from "@/lib/supabase/server";
import { AssetGrid } from "./asset-grid";

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect("/");
	}

	const myAssets = await getUserAssets(user.id);
	const activeAssets = myAssets.filter((a) => a.status === "Active");
	const draftAssets = myAssets.filter((a) => a.status === "Draft");
	const archivedAssets = myAssets.filter((a) => a.status === "Archived");

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Dashboard Header */}
			<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground">
						Manage your assets and view your sales performance.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" disabled>
						<Settings className="mr-2 h-4 w-4" />
						Settings
					</Button>
					<Button asChild>
						<Link href="/assets/create">
							<Plus className="mr-2 h-4 w-4" />
							Create New Asset
						</Link>
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<span className="text-muted-foreground font-bold">$</span>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$0</div>
						<p className="text-xs text-muted-foreground">+0% from last month</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Sales</CardTitle>
						<Download className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">+0% from last month</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Assets</CardTitle>
						<div className="h-4 w-4 rounded-full bg-green-500/20" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeAssets.length}</div>
						<p className="text-xs text-muted-foreground">
							{draftAssets.length} drafts pending review
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Followers</CardTitle>
						<div className="h-4 w-4 rounded-full bg-primary/20" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">+0 new followers</p>
					</CardContent>
				</Card>
			</div>

			{/* Assets Management */}
			<Tabs defaultValue="all" className="space-y-4">
				<div className="flex items-center justify-between">
					<TabsList>
						<TabsTrigger value="all" suppressHydrationWarning>
							All Assets
						</TabsTrigger>
						<TabsTrigger value="active">Active</TabsTrigger>
						<TabsTrigger value="draft">Drafts</TabsTrigger>
						<TabsTrigger value="archived">Archived</TabsTrigger>
					</TabsList>
				</div>
				<TabsContent value="all" className="space-y-4">
					<AssetGrid assets={myAssets} showCreatePlaceholder={true} />
				</TabsContent>
				<TabsContent value="active" className="space-y-4">
					<AssetGrid assets={activeAssets} />
				</TabsContent>
				<TabsContent value="draft" className="space-y-4">
					<AssetGrid assets={draftAssets} />
				</TabsContent>
				<TabsContent value="archived" className="space-y-4">
					<AssetGrid assets={archivedAssets} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
