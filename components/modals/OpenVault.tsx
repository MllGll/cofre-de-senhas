import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OpenVaultProps = {
	showOpenVault: boolean;
	setShowOpenVault: Dispatch<SetStateAction<boolean>>;
	masterPassword: string;
	setMasterPassword: Dispatch<SetStateAction<string>>;
	openExistingVault: () => void;
	loading: boolean;
};

export default function OpenVault({
	showOpenVault,
	setShowOpenVault,
	masterPassword,
	setMasterPassword,
	openExistingVault,
	loading,
}: OpenVaultProps) {
	return (
		<Dialog open={showOpenVault} onOpenChange={setShowOpenVault}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Abrir Cofre Existente</DialogTitle>
					<DialogDescription>
						{
							"Digite a senha mestra do cofre e então selecione o arquivo .vault"
						}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div>
						<Label htmlFor="master-password-open">Senha Mestra</Label>
						<Input
							type="password"
							value={masterPassword}
							onChange={(e) => setMasterPassword(e.target.value)}
							placeholder="Digite sua senha mestra"
						/>
					</div>

					<div className="flex gap-2 pt-4">
						<Button
							onClick={openExistingVault}
							disabled={loading}
							className="flex-1"
						>
							{loading ? "Abrindo..." : "Abrir Cofre"}
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								setShowOpenVault(false);
								setMasterPassword("");
							}}
							disabled={loading}
						>
							Cancelar
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
