import { Monitor, Moon, Sun } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { AppSettings } from "@/types";

type SettingsProps = {
	showSettings: boolean;
	setShowSettings: Dispatch<SetStateAction<boolean>>;
	settings: AppSettings;
	setSettings: Dispatch<SetStateAction<AppSettings>>;
	saveSettings: () => void;
};

export default function Settings({
	showSettings,
	setShowSettings,
	settings,
	setSettings,
	saveSettings,
}: SettingsProps) {
	return (
		<Dialog open={showSettings} onOpenChange={setShowSettings}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Configurações</DialogTitle>
					<DialogDescription>
						Personalize o comportamento do sistema
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					<div>
						<Label>Tema</Label>
						<Select
							value={settings.theme}
							onValueChange={(value: "light" | "dark" | "system") =>
								setSettings((prev) => ({ ...prev, theme: value }))
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="light">
									<div className="flex items-center gap-2">
										<Sun className="w-4 h-4" />
										Claro
									</div>
								</SelectItem>
								<SelectItem value="dark">
									<div className="flex items-center gap-2">
										<Moon className="w-4 h-4" />
										Escuro
									</div>
								</SelectItem>
								<SelectItem value="system">
									<div className="flex items-center gap-2">
										<Monitor className="w-4 h-4" />
										Sistema
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>Tempo de Bloqueio Automático</Label>
						<Select
							value={settings.lockTimeout.toString()}
							onValueChange={(value) =>
								setSettings((prev) => ({
									...prev,
									lockTimeout: Number.parseInt(value),
								}))
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="0">Desabilitado</SelectItem>
								<SelectItem value="1">1 minuto</SelectItem>
								<SelectItem value="5">5 minutos</SelectItem>
								<SelectItem value="10">10 minutos</SelectItem>
								<SelectItem value="15">15 minutos</SelectItem>
								<SelectItem value="30">30 minutos</SelectItem>
								<SelectItem value="60">1 hora</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex gap-2 pt-4">
						<Button onClick={saveSettings} className="flex-1">
							Salvar Configurações
						</Button>
						<Button variant="outline" onClick={() => setShowSettings(false)}>
							Cancelar
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
