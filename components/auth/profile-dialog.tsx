"use client";

import type { User } from "@supabase/supabase-js";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	ImageCrop,
	ImageCropApply,
	ImageCropContent,
	ImageCropReset,
} from "@/components/ui/shadcn-io/image-crop";

interface ProfileDialogProps {
	user: User;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({
	user,
	open,
	onOpenChange,
}: ProfileDialogProps) {
	const [username, setUsername] = useState(user.user_metadata.username);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setSelectedFile(e.target.files[0]);
		}
	};

	const handleCrop = (croppedImage: string) => {
		setAvatarPreview(croppedImage);
		setSelectedFile(null);
	};

	const handleCancelCrop = () => {
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{selectedFile ? "Crop Avatar" : "Edit Profile"}
					</DialogTitle>
					<DialogDescription>
						{selectedFile
							? "Adjust the crop area for your avatar."
							: "Make changes to your profile here. Click save when you're done."}
					</DialogDescription>
				</DialogHeader>

				{selectedFile ? (
					<div className="flex flex-col items-center gap-4 py-4">
						<ImageCrop file={selectedFile} onCrop={handleCrop} aspect={1}>
							<div className="relative flex items-center justify-center">
								<ImageCropContent />
							</div>
							<div className="mt-4 flex justify-center gap-2">
								<Button
									variant="outline"
									size="icon"
									onClick={handleCancelCrop}
								>
									<X className="h-4 w-4" />
								</Button>
								<ImageCropReset />
								<ImageCropApply />
							</div>
						</ImageCrop>
					</div>
				) : (
					<>
						<div className="grid gap-4 py-4">
							<div className="flex flex-col items-center gap-4">
								<Avatar className="h-24 w-24">
									<AvatarImage
										src={avatarPreview || user.user_metadata.avatar_url}
										alt={user.email || "User avatar"}
									/>
									<AvatarFallback className="text-2xl">
										{user.email?.charAt(0).toUpperCase() ?? "U"}
									</AvatarFallback>
								</Avatar>
								<input
									type="file"
									accept="image/*"
									className="hidden"
									ref={fileInputRef}
									onChange={handleFileChange}
								/>
								<Button
									variant="outline"
									size="sm"
									onClick={() => fileInputRef.current?.click()}
								>
									Change Avatar
								</Button>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="username" className="text-right">
									Username
								</Label>
								<Input
									id="username"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="password" className="text-right">
									Password
								</Label>
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									className="col-span-3"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button type="submit" onClick={() => onOpenChange(false)}>
								Save changes
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
