"use client";

import {
	Archive,
	Copy,
	Edit,
	ExternalLink,
	MoreVertical,
	Plus,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteAsset, duplicateAsset, updateAssetStatus } from "./actions";
import type { AssetWithCreator } from "@/lib/assets";

interface AssetGridProps {
	assets: AssetWithCreator[];
	showCreatePlaceholder?: boolean;
}

export function AssetGrid({
	assets,
	showCreatePlaceholder = false,
}: AssetGridProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
			{assets.map((asset) => (
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
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="secondary"
										size="icon"
										className="h-8 w-8 backdrop-blur-md bg-background/50"
									>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{asset.status !== "Archived" && (
										<DropdownMenuItem
											onClick={() => updateAssetStatus(asset.id, "Archived")}
										>
											<Archive className="mr-2 h-4 w-4" />
											Archive
										</DropdownMenuItem>
									)}
									{asset.status === "Archived" && (
										<>
											<DropdownMenuItem
												onClick={() => duplicateAsset(asset.id)}
											>
												<Copy className="mr-2 h-4 w-4" />
												Duplicate as Draft
											</DropdownMenuItem>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<DropdownMenuItem
														className="text-destructive focus:text-destructive"
														onSelect={(e) => e.preventDefault()}
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete Permanently
													</DropdownMenuItem>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Are you absolutely sure?
														</AlertDialogTitle>
														<AlertDialogDescription>
															This action cannot be undone. This will
															permanently delete your asset and remove it from
															our servers.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
															onClick={() => deleteAsset(asset.id)}
														>
															Delete
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						<div className="absolute bottom-2 left-2">
							<span
								className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-md ${
									asset.status === "Active"
										? "bg-green-700/20 text-green-700"
										: asset.status === "Draft"
											? "bg-yellow-700/20 text-yellow-700"
											: "bg-gray-700/20 text-gray-700"
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
								<p className="text-xs text-muted-foreground mt-1">Asset</p>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-4 pt-0 pb-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Price</span>
							<span className="font-medium">${asset.price.toFixed(2)}</span>
						</div>
						<div className="flex justify-between text-sm mt-1">
							<span className="text-muted-foreground">Sales</span>
							<span className="font-medium">0</span>
						</div>
					</CardContent>
					<CardFooter className="p-4 pt-2 flex flex-col gap-2">
						<div className="flex w-full gap-2">
							<Button variant="outline" size="sm" className="flex-1" asChild>
								<Link href={`/assets/${asset.id}/edit`}>
									<Edit className="mr-2 h-3 w-3" />
									Edit
								</Link>
							</Button>
							<Button variant="outline" size="sm" className="flex-1" asChild>
								<Link href={`/assets/${asset.id}`} target="_blank">
									View Product <ExternalLink className="ml-2 h-3 w-3" />
								</Link>
							</Button>
						</div>
						{asset.status === "Draft" && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button size="sm" className="w-full">
										<ExternalLink className="mr-2 h-3 w-3" />
										Publish
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Ready to publish?</AlertDialogTitle>
										<AlertDialogDescription>
											This action cannot be undone. Once published, the asset
											will be live and immutable. You won't be able to change it
											back to draft.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => updateAssetStatus(asset.id, "Active")}
										>
											Publish
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</CardFooter>
				</Card>
			))}
			{showCreatePlaceholder && (
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
			)}
		</div>
	);
}
