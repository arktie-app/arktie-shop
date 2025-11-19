"use client";

import { useState } from "react";
import { signup } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(formData: FormData) {
		setLoading(true);
		setError(null);
		setSuccess(null);
		const result = await signup(formData);
		if (result?.error) {
			setError(result.error);
			setLoading(false);
		} else if (result?.success) {
			setSuccess(result.message || "Account created successfully!");
			setLoading(false);
		}
	}

	return (
		<form action={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="signup-email">Email</Label>
				<Input
					id="signup-email"
					name="email"
					type="email"
					placeholder="you@example.com"
					required
					disabled={loading}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="signup-password">Password</Label>
				<Input
					id="signup-password"
					name="password"
					type="password"
					placeholder="••••••••"
					required
					minLength={6}
					disabled={loading}
				/>
			</div>
			{error && <div className="text-sm text-destructive">{error}</div>}
			{success && (
				<div className="text-sm text-green-600 dark:text-green-400">
					{success}
				</div>
			)}
			<Button type="submit" className="w-full" disabled={loading}>
				{loading ? "Creating account..." : "Sign up"}
			</Button>
		</form>
	);
}
