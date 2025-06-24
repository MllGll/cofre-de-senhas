import { Save } from "lucide-react";
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

type EditCredentialProps = {
	editingCredential: Credential | null;
	setEditingCredential: Dispatch<SetStateAction<Credential | null>>;
	updateCredential: () => void;
	categories: Array<string>;
};

export default function EditCredential({
	editingCredential,
	setEditingCredential,
	updateCredential,
	categories,
}: EditCredentialProps) {
	return (
		<Dialog
			open={!!editingCredential}
			onOpenChange={() => setEditingCredential(null)}
		>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Editar Credencial</DialogTitle>
					<DialogDescription>
						Modifique os dados da credencial
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="cred-name">Nome</Label>
							<Input
								value={editingCredential?.name}
								onChange={(e) =>
									setEditingCredential((prev) =>
										prev ? { ...prev, name: e.target.value } : null,
									)
								}
								placeholder="Ex: Gmail Pessoal"
							/>
						</div>

						<div>
							<Label htmlFor="cred-category">Categoria</Label>
							<Select
								value={editingCredential?.category}
								onValueChange={(value) =>
									setEditingCredential((prev) =>
										prev ? { ...prev, category: value } : null,
									)
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
								value={editingCredential?.username || ""}
								onChange={(e) =>
									setEditingCredential((prev) =>
										prev ? { ...prev, username: e.target.value } : null,
									)
								}
								placeholder="usuario@email.com"
							/>
						</div>

						<div>
							<Label htmlFor="cred-password">Senha</Label>
							<Input
								type="password"
								value={editingCredential?.password || ""}
								onChange={(e) =>
									setEditingCredential((prev) =>
										prev ? { ...prev, password: e.target.value } : null,
									)
								}
								placeholder="Senha segura"
							/>
						</div>
					</div>

					<div>
						<Label htmlFor="cred-url">URL (opcional)</Label>
						<Input
							value={editingCredential?.url || ""}
							onChange={(e) =>
								setEditingCredential((prev) =>
									prev ? { ...prev, url: e.target.value } : null,
								)
							}
							placeholder="https://exemplo.com"
						/>
					</div>

					<div>
						<Label htmlFor="cred-notes">Observações (opcional)</Label>
						<Textarea
							value={editingCredential?.notes || ""}
							onChange={(e) =>
								setEditingCredential((prev) =>
									prev ? { ...prev, notes: e.target.value } : null,
								)
							}
							placeholder="Informações adicionais..."
							rows={3}
						/>
					</div>

					<div className="flex gap-2 pt-4">
						<Button onClick={updateCredential} className="flex-1">
							<Save className="w-4 h-4 mr-2" />
							Salvar Alterações
						</Button>

						<Button
							variant="outline"
							onClick={() => setEditingCredential(null)}
						>
							Cancelar
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
