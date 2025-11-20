import { Download, Edit, MoreVertical, Plus, Settings } from "lucide-react";
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
import { createClient } from "@/lib/supabase/server";

// Mock Data
const MY_ASSETS = [
	{
		id: 1,
		title: "Cyberpunk Cityscape Vol. 1",
		type: "Illustration",
		price: "¥1,500",
		sales: 124,
		status: "Active",
		image: "bg-linear-to-tr from-pink-500/20 to-purple-500/20",
	},
	{
		id: 2,
		title: "Neon Tokyo Street Pack",
		type: "3D Model",
		price: "¥3,000",
		sales: 85,
		status: "Active",
		image: "bg-linear-to-tr from-blue-500/20 to-cyan-500/20",
	},
	{
		id: 3,
		title: "Anime Character Base Mesh",
		type: "3D Model",
		price: "¥2,500",
		sales: 256,
		status: "Active",
		image: "bg-linear-to-tr from-orange-500/20 to-red-500/20",
	},
	{
		id: 4,
		title: "Fantasy Weapon Icons",
		type: "Icon Set",
		price: "¥800",
		sales: 42,
		status: "Draft",
		image: "bg-linear-to-tr from-green-500/20 to-emerald-500/20",
	},
	{
		id: 5,
		title: "Lo-Fi Study Beats Pack",
		type: "Audio",
		price: "¥1,200",
		sales: 15,
		status: "Active",
		image: "bg-linear-to-tr from-indigo-500/20 to-violet-500/20",
	},
];

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect("/");
	}

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
						<div className="text-2xl font-bold">¥452,300</div>
						<p className="text-xs text-muted-foreground">
							+20.1% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Sales</CardTitle>
						<Download className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">+573</div>
						<p className="text-xs text-muted-foreground">
							+12% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Assets</CardTitle>
						<div className="h-4 w-4 rounded-full bg-green-500/20" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">12</div>
						<p className="text-xs text-muted-foreground">
							2 drafts pending review
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Followers</CardTitle>
						<div className="h-4 w-4 rounded-full bg-primary/20" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">2,350</div>
						<p className="text-xs text-muted-foreground">+180 new followers</p>
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
						{MY_ASSETS.map((asset) => (
							<Card
								key={asset.id}
								className="group overflow-hidden transition-all hover:shadow-lg"
							>
								<div className="aspect-video relative bg-muted overflow-hidden">
									<div
										className={`absolute inset-0 ${asset.image} group-hover:scale-105 transition-transform duration-500`}
									/>
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
													: "bg-yellow-500/20 text-yellow-500"
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
												{asset.title}
											</CardTitle>
											<p className="text-xs text-muted-foreground mt-1">
												{asset.type}
											</p>
										</div>
									</div>
								</CardHeader>
								<CardContent className="p-4 pt-0 pb-2">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Price</span>
										<span className="font-medium">{asset.price}</span>
									</div>
									<div className="flex justify-between text-sm mt-1">
										<span className="text-muted-foreground">Sales</span>
										<span className="font-medium">{asset.sales}</span>
									</div>
								</CardContent>
								<CardFooter className="p-4 pt-2 flex gap-2">
									<Button variant="outline" size="sm" className="flex-1">
										<Edit className="mr-2 h-3 w-3" />
										Edit
									</Button>
									<Button variant="secondary" size="sm" className="flex-1">
										Analytics
									</Button>
								</CardFooter>
							</Card>
						))}
						{/* Add New Placeholder */}
						<Button
							variant="outline"
							className="h-full min-h-[300px] flex flex-col gap-4 border-dashed hover:border-primary hover:bg-primary/5"
						>
							<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
								<Plus className="h-6 w-6 text-muted-foreground" />
							</div>
							<span className="font-medium">Create New Asset</span>
						</Button>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
