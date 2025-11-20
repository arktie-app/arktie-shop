export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface Database {
	public: {
		Tables: {
			assets: {
				Row: {
					id: string;
					name: string;
					description: string | null;
					price: number;
					preview_images: string[];
					creator_id: string;
					status: "Active" | "Draft" | "Archived";
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					description?: string | null;
					price: number;
					preview_images?: string[];
					creator_id: string;
					status?: "Active" | "Draft" | "Archived";
					created_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					description?: string | null;
					price?: number;
					preview_images?: string[];
					creator_id?: string;
					status?: "Active" | "Draft" | "Archived";
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "assets_creator_id_fkey";
						columns: ["creator_id"];
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
				];
			};
			profiles: {
				Row: {
					id: string;
					username: string;
					avatar_url: string | null;
					created_at: string;
				};
				Insert: {
					id: string;
					username: string;
					avatar_url?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					username?: string;
					avatar_url?: string | null;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "profiles_id_fkey";
						columns: ["id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			asset_status: "Active" | "Draft" | "Archived";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}
