"use client";

import { useState } from "react";
import { toast } from "sonner";
import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";

export function LoginForm() {
	const [loading, setLoading] = useState(false);

	async function handleSubmit(formData: FormData) {
		try {
			setLoading(true);
			const error = await login(formData);
			if (error && error instanceof Error) throw error;
		} catch (error) {
			toast.error(`Failed to sign in: ${error}`);
		} finally {
			setLoading(false);
		}
		redirect("/dashboard");
	}

	return (
		<form action={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="login-email">Email</Label>
				<Input
					id="login-email"
					name="email"
					type="email"
					placeholder="you@example.com"
					required
					disabled={loading}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="login-password">Password</Label>
				<Input
					id="login-password"
					name="password"
					type="password"
					placeholder="••••••••"
					required
					disabled={loading}
				/>
			</div>
			<Button type="submit" className="w-full" disabled={loading}>
				{loading ? "Signing in..." : "Sign in"}
			</Button>
		</form>
	);
}
