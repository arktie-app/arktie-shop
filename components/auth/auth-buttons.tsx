"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "./auth-dialog";

export function AuthButtons() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [defaultTab, setDefaultTab] = useState<"login" | "signup">("login");

	const handleOpenDialog = (tab: "login" | "signup") => {
		setDefaultTab(tab);
		setDialogOpen(true);
	};

	return (
		<>
			<Button variant="ghost" onClick={() => handleOpenDialog("login")}>
				Log in
			</Button>
			<Button onClick={() => handleOpenDialog("signup")}>Sign up</Button>
			<AuthDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				defaultTab={defaultTab}
				setDefaultTab={setDefaultTab}
			/>
		</>
	);
}
