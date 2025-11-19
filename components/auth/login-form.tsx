"use client";

import { useState } from "react";
import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(formData: FormData) {
		setLoading(true);
		setError(null);
		const result = await login(formData);
		if (result?.error) {
			setError(result.error);
			setLoading(false);
		}
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
			{error && <div className="text-sm text-destructive">{error}</div>}
			<Button type="submit" className="w-full" disabled={loading}>
				{loading ? "Signing in..." : "Sign in"}
			</Button>
		</form>
	);
}
