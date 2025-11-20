import { Search } from "lucide-react";
import { AuthButtons } from "@/components/auth/auth-buttons";
import { UserNav } from "@/components/auth/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<div className="mr-4 flex items-center space-x-2">
					<a href="/" className="text-2xl font-bold text-primary">
						Arktie
					</a>
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
						{user ? <UserNav user={user} /> : <AuthButtons />}
						<ModeToggle />
					</nav>
				</div>
			</div>
		</header>
	);
}
