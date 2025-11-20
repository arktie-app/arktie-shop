interface User {
	username: string;
	avatar?: string;
}

export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	images: string[];
	creator: User;
}

export const products: Product[] = [
	{
		id: "550e8400-e29b-41d4-a716-446655440000",
		name: "Neon Cyber Katana",
		description:
			"A high-tech katana with neon accents, perfect for the modern samurai. Features a razor-sharp edge and a lightweight carbon fiber handle.",
		price: 1200,
		images: [
			"/products/katana.png",
			"/products/katana-detail.png",
			"/products/katana-action.png",
		],
		creator: {
			username: "artist1",
		},
	},
	{
		id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
		name: "Holographic Hoodie",
		description:
			"Stay stylish and visible with this holographic hoodie. The fabric reflects light in a spectrum of colors, making you stand out in any crowd.",
		price: 85,
		images: [
			"/products/hoodie.png",
			"/products/hoodie-back.png",
			"/products/hoodie-detail.png",
		],
		creator: {
			username: "artist2",
		},
	},
	{
		id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
		name: "Retro Arcade Cabinet",
		description:
			"Relive the glory days of gaming with this restored retro arcade cabinet. Pre-loaded with 50 classic games.",
		price: 2500,
		images: [
			"/products/arcade.png",
			"/products/arcade-screen.png",
			"/products/arcade-side.png",
		],
		creator: {
			username: "artist3",
		},
	},
];
