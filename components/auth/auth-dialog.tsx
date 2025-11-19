"use client";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

interface AuthDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultTab: "login" | "signup";
	setDefaultTab: (tab: "login" | "signup") => void;
}

export function AuthDialog({
	open,
	onOpenChange,
	defaultTab,
	setDefaultTab,
}: AuthDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Welcome to Arktie Shop</DialogTitle>
					<DialogDescription>
						Sign in to your account or create a new one to get started.
					</DialogDescription>
				</DialogHeader>
				<Tabs
					value={defaultTab}
					onValueChange={(v) => setDefaultTab(v as "login" | "signup")}
				>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="login">Log in</TabsTrigger>
						<TabsTrigger value="signup">Sign up</TabsTrigger>
					</TabsList>
					<TabsContent value="login" className="mt-4">
						<LoginForm />
					</TabsContent>
					<TabsContent value="signup" className="mt-4">
						<SignupForm />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
