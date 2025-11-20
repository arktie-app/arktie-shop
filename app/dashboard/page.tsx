import {
	Download,
	Edit,
	ExternalLink,
	ExternalLinkIcon,
	MoreVertical,
	Plus,
	Settings,
} from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserAssets } from "@/lib/assets";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect("/");
	}

	const myAssets = await getUserAssets(user.id);

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
					<Button variant="outline">
						<Settings className="mr-2 h-4 w-4" />
						Settings
					</Button>
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Create New Asset
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<span className="text-muted-foreground font-bold">¥</span>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">¥0</div>
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
						<div className="text-2xl font-bold">
							{myAssets.filter((a) => a.status === "Active").length}
						</div>
						<p className="text-xs text-muted-foreground">
							{myAssets.filter((a) => a.status === "Draft").length} drafts
							pending review
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
						<TabsTrigger value="all">All Assets</TabsTrigger>
						<TabsTrigger value="active">Active</TabsTrigger>
						<TabsTrigger value="draft">Drafts</TabsTrigger>
						<TabsTrigger value="archived">Archived</TabsTrigger>
					</TabsList>
				</div>
				<TabsContent value="all" className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{myAssets.map((asset) => (
							<Card
								key={asset.id}
								className="group overflow-hidden transition-all hover:shadow-lg"
							>
								<div className="aspect-video relative bg-muted overflow-hidden">
									{asset.preview_images && asset.preview_images.length > 0 ? (
										<div
											className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
											style={{
												backgroundImage: `url(${asset.preview_images[0]})`,
											}}
										/>
									) : (
										<div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
											No Image
										</div>
									)}
									<div className="absolute top-2 right-2">
										<Button
											variant="secondary"
											size="icon"
											className="h-8 w-8 backdrop-blur-md bg-background/50"
										>
											<MoreVertical className="h-4 w-4" />
										</Button>
									</div>
									<div className="absolute bottom-2 left-2">
										<span
											className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-md ${
												asset.status === "Active"
													? "bg-green-500/20 text-green-500"
													: asset.status === "Draft"
														? "bg-yellow-500/20 text-yellow-500"
														: "bg-gray-500/20 text-gray-500"
											}`}
										>
											{asset.status}
										</span>
									</div>
								</div>
								<CardHeader className="p-4 pb-2">
									<div className="flex justify-between items-start">
										<div>
											<CardTitle className="text-base line-clamp-1">
												{asset.name}
											</CardTitle>
											<p className="text-xs text-muted-foreground mt-1">
												Asset
											</p>
										</div>
									</div>
								</CardHeader>
								<CardContent className="p-4 pt-0 pb-2">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Price</span>
										<span className="font-medium">¥{asset.price}</span>
									</div>
									<div className="flex justify-between text-sm mt-1">
										<span className="text-muted-foreground">Sales</span>
										<span className="font-medium">0</span>
									</div>
								</CardContent>
								<CardFooter className="p-4 pt-2 flex gap-2">
									<Button variant="outline" size="sm" className="flex-1">
										<Edit className="mr-2 h-3 w-3" />
										Edit
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="flex-1"
										asChild
									>
										<Link href={`/assets/${asset.id}`} target="_blank">
											View Product <ExternalLink className="ml-2 h-3 w-3" />
										</Link>
									</Button>
								</CardFooter>
							</Card>
						))}
						{/* Add New Placeholder */}
						<Button
							variant="outline"
							className="h-full min-h-[300px] flex flex-col gap-4 border-dashed hover:border-primary hover:bg-primary/5"
							asChild
						>
							<Link href="/assets/create">
								<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
									<Plus className="h-6 w-6 text-muted-foreground" />
								</div>
								<span className="font-medium">Create New Asset</span>
							</Link>
						</Button>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
