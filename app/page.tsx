import { Search } from "lucide-react";
import { AuthButtons } from "@/components/auth/auth-buttons";
import { UserNav } from "@/components/auth/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return (
		<div className="flex min-h-screen flex-col">
			{/* Header / Navigation */}
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				<div className="container mx-auto flex h-16 items-center justify-between px-4">
					<div className="mr-4 flex items-center space-x-2">
						<span className="text-2xl font-bold text-primary">Arktie</span>
					</div>
					<div className="flex flex-1 items-center justify-center space-x-2 md:justify-end">
						<div className="w-full max-w-lg md:w-auto md:flex-none">
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search assets..."
									className="pl-8 md:w-[300px] lg:w-[400px]"
								/>
							</div>
						</div>
						<nav className="flex items-center space-x-2">
							{!user && <AuthButtons />}
							{user && <UserNav user={user} />}
							<ModeToggle />
						</nav>
					</div>
				</div>
			</header>

			<main className="flex-1">
				{/* Hero Section */}
				<section className="relative overflow-hidden py-20 md:py-32 bg-linear-to-b from-background to-secondary/20">
					<div className="container mx-auto relative z-10 flex flex-col items-center text-center px-4">
						<h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-600 animate-in fade-in zoom-in duration-1000">
							Discover & Sell <br />
							<span className="text-foreground">Anime Digital Assets</span>
						</h1>
						<p className="mt-6 max-w-[600px] text-lg text-muted-foreground md:text-xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
							The premier marketplace for creators. Illustrations, 3D models,
							photography, and more. Join the Arktie community today.
						</p>
						<div className="mt-8 flex space-x-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
							<Button size="lg" className="rounded-full text-lg px-8">
								Explore Shop
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="rounded-full text-lg px-8"
							>
								Start Selling
							</Button>
						</div>
					</div>
					{/* Decorative Background Elements */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
				</section>

				{/* Featured Assets Section */}
				<section className="py-16 container mx-auto px-4">
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-3xl font-bold tracking-tight">
							Featured Assets
						</h2>
						<Button variant="link" className="text-primary">
							View all
						</Button>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{/* Dummy Data */}
						{Array.from({ length: 8 }).map((_, i) => {
							return (
								<Card
									// biome-ignore lint/suspicious/noArrayIndexKey: Dummy data
									key={i}
									className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group bg-card/50 backdrop-blur-sm"
								>
									<div className="aspect-3/4 relative bg-muted overflow-hidden">
										{/* Placeholder for asset image */}
										<div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-secondary/20 group-hover:scale-105 transition-transform duration-500" />
										<div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
											Illustration
										</div>
									</div>
									<CardHeader className="p-4 pb-0">
										<CardTitle className="text-lg truncate">
											Cyberpunk Cityscape Vol. {i + 1}
										</CardTitle>
										<p className="text-sm text-muted-foreground">
											by ArktieCreator
										</p>
									</CardHeader>
									<CardFooter className="p-4 flex items-center justify-between">
										<span className="font-bold text-lg">¥1,500</span>
										<Button
											size="sm"
											variant="secondary"
											className="rounded-full"
										>
											Add
										</Button>
									</CardFooter>
								</Card>
							);
						})}
					</div>
				</section>
			</main>

			<footer className="border-t py-8 bg-secondary/30">
				<div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4">
					<p className="text-sm text-muted-foreground">
						© 2024 Arktie Shop. All rights reserved.
					</p>
					<div className="flex space-x-4 text-sm text-muted-foreground">
						<a href="/" className="hover:text-primary">
							Terms
						</a>
						<a href="/" className="hover:text-primary">
							Privacy
						</a>
						<a href="/" className="hover:text-primary">
							Contact
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
