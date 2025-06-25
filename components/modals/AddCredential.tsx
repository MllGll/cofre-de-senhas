import { Plus } from "lucide-react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Credential } from "@/types";
import { Textarea } from "../ui/textarea";

type AddCredentialProps = {
	showAddCredential: boolean;
	setShowAddCredential: Dispatch<SetStateAction<boolean>>;
	newCredential: Partial<Credential>;
	setNewCredential: Dispatch<SetStateAction<Partial<Credential>>>;
	addCredential: () => void;
	categories: Array<string>;
};

export default function AddCredential({
	showAddCredential,
	setShowAddCredential,
	newCredential,
	setNewCredential,
	addCredential,
	categories,
}: AddCredentialProps) {
	return (
		<Dialog open={showAddCredential} onOpenChange={setShowAddCredential}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Adicionar Nova Credencial</DialogTitle>
					<DialogDescription>
						Preencha os dados da nova credencial
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="cred-name">Nome</Label>
							<Input
								value={newCredential.name || ""}
								onChange={(e) =>
									setNewCredential((prev) => ({
										...prev,
										name: e.target.value,
									}))
								}
								placeholder="Ex: Gmail Pessoal"
								maxLength={50}
							/>
						</div>

						<div>
							<Label htmlFor="cred-category">Categoria</Label>
							<Select
								value={newCredential.category}
								onValueChange={(value) =>
									setNewCredential((prev) => ({
										...prev,
										category: value,
									}))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="cred-username">Usuário/Login</Label>
							<Input
								value={newCredential.username || ""}
								onChange={(e) =>
									setNewCredential((prev) => ({
										...prev,
										username: e.target.value,
									}))
								}
								placeholder="usuario@email.com"
								maxLength={50}
							/>
						</div>

						<div>
							<Label htmlFor="cred-password">Senha</Label>
							<Input
								type="password"
								value={newCredential.password || ""}
								onChange={(e) =>
									setNewCredential((prev) => ({
										...prev,
										password: e.target.value,
									}))
								}
								placeholder="Senha segura"
								maxLength={50}
							/>
						</div>
					</div>

					<div>
						<Label htmlFor="cred-url">URL (opcional)</Label>
						<Input
							value={newCredential.url || ""}
							onChange={(e) =>
								setNewCredential((prev) => ({
									...prev,
									url: e.target.value,
								}))
							}
							placeholder="https://exemplo.com"
							maxLength={100}
						/>
					</div>

					<div>
						<Label htmlFor="cred-notes">Observações (opcional)</Label>
						<Textarea
							value={newCredential.notes || ""}
							onChange={(e) =>
								setNewCredential((prev) => ({
									...prev,
									notes: e.target.value,
								}))
							}
							placeholder="Informações adicionais..."
							rows={3}
							maxLength={500}
						/>
					</div>

					<div className="flex gap-2 pt-4">
						<Button onClick={addCredential} className="flex-1">
							<Plus className="w-4 h-4 mr-2" />
							Adicionar Credencial
						</Button>
						<Button
							variant="outline"
							onClick={() => setShowAddCredential(false)}
						>
							Cancelar
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
