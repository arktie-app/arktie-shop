"use client";

import { useState } from "react";
import { toast } from "sonner";
import { signup } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
	const [loading, setLoading] = useState(false);

	async function handleSubmit(formData: FormData) {
		try {
			setLoading(true);
			const result = await signup(formData);
			if (result.error) throw result.error;

			toast.success(result.message || "Account created successfully!");
		} catch (error) {
			console.error(error);
			toast.error("Failed to create account");
		} finally {
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
			<Button type="submit" className="w-full" disabled={loading}>
				{loading ? "Creating account..." : "Sign up"}
			</Button>
		</form>
	);
}
