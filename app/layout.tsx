import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const outfit = Outfit({
	subsets: ["latin"],
	variable: "--font-outfit",
});

export const metadata: Metadata = {
	title: "Arktie Shop | Digital Assets Store",
	description:
		"Premium digital assets for creators. Illustrations, 3D models, and more.",
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={cn(
					"min-h-screen bg-background font-sans antialiased",
					outfit.variable,
				)}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<main className="relative flex min-h-screen flex-col">
						{children}
					</main>
				</ThemeProvider>
			</body>
		</html>
	);
}
