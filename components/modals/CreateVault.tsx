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

type CreateVaultProps = {
	showCreateVault: boolean;
	setShowCreateVault: Dispatch<SetStateAction<boolean>>;
	vaultName: string;
	setVaultName: Dispatch<SetStateAction<string>>;
	masterPassword: string;
	setMasterPassword: Dispatch<SetStateAction<string>>;
	createNewVault: () => void;
	loading: boolean;
};

export default function CreateVault({
	showCreateVault,
	setShowCreateVault,
	vaultName,
	setVaultName,
	masterPassword,
	setMasterPassword,
	createNewVault,
	loading,
}: CreateVaultProps) {
	return (
		<Dialog open={showCreateVault} onOpenChange={setShowCreateVault}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Criar Novo Cofre</DialogTitle>
					<DialogDescription>
						Escolha um nome e uma senha mestra segura para seu cofre
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div>
						<Label htmlFor="vault-name">Nome do Cofre</Label>
						<Input
							value={vaultName}
							onChange={(e) => setVaultName(e.target.value)}
							placeholder="Ex: Minhas Senhas"
						/>
					</div>

					<div>
						<Label htmlFor="master-password">Senha Mestra</Label>
						<Input
							type="password"
							value={masterPassword}
							onChange={(e) => setMasterPassword(e.target.value)}
							placeholder="Mínimo 8 caracteres"
						/>
						<p className="text-xs text-muted-foreground mt-1">
							⚠️ Se você perder esta senha, não será possível recuperar seus
							dados
						</p>
					</div>

					<div className="flex gap-2 pt-4">
						<Button
							onClick={createNewVault}
							disabled={loading}
							className="flex-1"
						>
							{loading ? "Criando..." : "Criar Cofre"}
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								setShowCreateVault(false);
								setVaultName("");
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
