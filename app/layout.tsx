import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
	title: "Cofre de Senhas Pessoal",
	description: "Gerencie suas senhas de forma segura sem guardar dados online",
	icons: {
		icon: "/favicon.svg",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR">
			<body>
				{children}
				<Toaster richColors position="top-center" />
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
