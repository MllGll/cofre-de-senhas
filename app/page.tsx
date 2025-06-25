"use client";

import {
	Copy,
	Edit,
	Eye,
	EyeOff,
	FolderOpen,
	Globe,
	Key,
	Lock,
	Plus,
	Search,
	Settings as SettingsIcon,
	StickyNote,
	Trash2,
	User,
	Vault,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AddCredential from "@/components/modals/AddCredential";
import CreateVault from "@/components/modals/CreateVault";
import EditCredential from "@/components/modals/EditCredential";
import OpenVault from "@/components/modals/OpenVault";
import Settings from "@/components/modals/Settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { StorageManager } from "@/lib/storage";
import { VaultManager } from "@/lib/vault";
import type { AppSettings, Credential, VaultData } from "@/types";

export default function PasswordVault() {
	// Estados principais
	const [isVaultOpen, setIsVaultOpen] = useState(false);
	const [vaultData, setVaultData] = useState<VaultData | null>(null);
	const [credentials, setCredentials] = useState<Credential[]>([]);
	const [settings, setSettings] = useState<AppSettings>({
		theme: "system",
		lockTimeout: 5,
	});

	// Estados da UI
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [showCreateVault, setShowCreateVault] = useState(false);
	const [showOpenVault, setShowOpenVault] = useState(false);
	const [showAddCredential, setShowAddCredential] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [editingCredential, setEditingCredential] = useState<Credential | null>(
		null,
	);
	const [showPasswords, setShowPasswords] = useState<{
		[key: string]: boolean;
	}>({});

	// Estados de formulário
	const [masterPassword, setMasterPassword] = useState("");
	const [vaultName, setVaultName] = useState("");
	const [newCredential, setNewCredential] = useState<Partial<Credential>>({
		name: "",
		username: "",
		password: "",
		url: "",
		notes: "",
		category: "",
	});

	// Estados de loading e erro
	const [loading, setLoading] = useState(false);

	// Refs
	const vaultManager = useRef<VaultManager | null>(null);
	const storageManager = useRef<StorageManager | null>(null);
	const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastActivityRef = useRef<number>(Date.now());
	const activeMasterPasswordRef = useRef<string>("");

	// Categorias disponíveis
	const categories = [
		"Email",
		"Redes Sociais",
		"Trabalho",
		"Bancos",
		"Compras",
		"Streamings",
		"Games",
		"Educação",
		"Saúde",
		"Outros",
	];

	// Verificar suporte à File System Access API e contexto
	const isFileSystemAccessSupported =
		typeof window !== "undefined" && "showOpenFilePicker" in window;

	// Funções utilitárias
	const applyTheme = (theme: string) => {
		if (typeof window === "undefined") return;

		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else if (theme === "light") {
			root.classList.remove("dark");
		} else {
			// System theme
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;
			if (prefersDark) {
				root.classList.add("dark");
			} else {
				root.classList.remove("dark");
			}
		}
	};

	// Inicialização
	// biome-ignore lint/correctness/useExhaustiveDependencies: evita re-renderizações
	useEffect(() => {
		const init = async () => {
			try {
				storageManager.current = new StorageManager();

				if (isFileSystemAccessSupported) {
					vaultManager.current = new VaultManager();
				}

				const savedSettings = await storageManager.current.getSettings();
				if (savedSettings) {
					setSettings(savedSettings);
				}

				// Aplicar tema
				applyTheme(savedSettings?.theme || "system");
			} catch (err) {
				console.error("Erro na inicialização:", err);
			}
		};

		init();
	}, [isFileSystemAccessSupported]);

	const lockVault = () => {
		clearSensitiveData();
		setIsVaultOpen(false);
		toast.message("Cofre bloqueado", {
			description: "Acesse as Configurações para ajustar as opções de bloqueio",
		});
	};

	// Sistema de bloqueio automático
	// biome-ignore lint/correctness/useExhaustiveDependencies: evita re-renderizações
	useEffect(() => {
		const resetLockTimeout = () => {
			if (lockTimeoutRef.current) {
				clearTimeout(lockTimeoutRef.current);
			}

			if (isVaultOpen && settings.lockTimeout > 0) {
				lockTimeoutRef.current = setTimeout(
					() => {
						lockVault();
					},
					settings.lockTimeout * 60 * 1000,
				);
			}
		};

		const handleActivity = () => {
			lastActivityRef.current = Date.now();
			resetLockTimeout();
		};

		if (isVaultOpen) {
			resetLockTimeout();

			// Adicionar listeners de atividade
			const events = [
				"mousedown",
				"mousemove",
				"keypress",
				"scroll",
				"touchstart",
			];
			events.forEach((event) => {
				document.addEventListener(event, handleActivity, true);
			});

			return () => {
				events.forEach((event) => {
					document.removeEventListener(event, handleActivity, true);
				});
				if (lockTimeoutRef.current) {
					clearTimeout(lockTimeoutRef.current);
				}
			};
		}
	}, [isVaultOpen, settings.lockTimeout]);

	const clearSensitiveData = () => {
		setVaultData(null);
		setCredentials([]);
		setMasterPassword("");
		activeMasterPasswordRef.current = "";
		// Forçar garbage collection
		if (typeof window !== "undefined" && (window as any).gc) {
			(window as any).gc();
		}
	};

	// Funções do cofre - File System Access API
	const createNewVault = async () => {
		if (!vaultName.trim() || !masterPassword.trim()) {
			toast.error("Nome do cofre e senha mestra são obrigatórios");
			return;
		}

		if (masterPassword.length < 8) {
			toast.error("A senha mestra deve ter pelo menos 8 caracteres");
			return;
		}

		const currentMasterPassword = masterPassword;

		setLoading(true);
		try {
			if (vaultManager.current) {
				// Modo File System Access API
				const handle = await vaultManager.current.createVault(
					vaultName,
					currentMasterPassword,
				);
				activeMasterPasswordRef.current = currentMasterPassword;

				setVaultData({ name: vaultName, handle });
				setCredentials([]);
				setIsVaultOpen(true);
				setShowCreateVault(false);
				setVaultName("");
				setMasterPassword("");

				toast.success("Cofre criado com sucesso");
			}
		} catch (err) {
			toast.error(
				`Erro ao criar cofre: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
			);
		} finally {
			setLoading(false);
		}
	};

	const openExistingVault = async () => {
		if (!masterPassword.trim()) {
			toast.error("Senha mestra é obrigatória");
			return;
		}

		const currentMasterPassword = masterPassword;

		setLoading(true);
		try {
			if (vaultManager.current) {
				// Modo File System Access API
				const result = await vaultManager.current.openVault(
					currentMasterPassword,
				);
				activeMasterPasswordRef.current = currentMasterPassword;

				setVaultData({ name: result.name, handle: result.handle });
				setCredentials(result.credentials);
				setIsVaultOpen(true);
				setShowOpenVault(false);
				setMasterPassword("");

				toast.success("Cofre aberto com sucesso");
			}
		} catch (err) {
			toast.error(
				`Erro ao abrir cofre: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
			);
		} finally {
			setLoading(false);
		}
	};

	const saveCredentials = async (updatedCredentials: Credential[]) => {
		if (!vaultData || !activeMasterPasswordRef.current) {
			toast.error(
				"Não foi possível salvar: cofre ou senha mestra não disponíveis.",
			);
			return;
		}

		try {
			if (vaultManager.current) {
				await vaultManager.current.saveCredentials(
					vaultData.handle,
					updatedCredentials,
					activeMasterPasswordRef.current,
				);
			}
		} catch (err) {
			toast.error(
				`Erro ao salvar: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
			);
		}
	};

	// Funções de credenciais
	const addCredential = async () => {
		if (
			!newCredential.name?.trim() ||
			!newCredential.username?.trim() ||
			!newCredential.password?.trim() ||
			!newCredential.category
		) {
			toast.error("Nome, categoria, usuário e senha são obrigatórios");
			return;
		}

		const credential: Credential = {
			id: Date.now().toString(),
			name: newCredential.name.trim(),
			username: newCredential.username.trim(),
			password: newCredential.password.trim(),
			url: newCredential.url?.trim() || "",
			notes: newCredential.notes?.trim() || "",
			category: newCredential.category,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const updatedCredentials = [...credentials, credential];
		setCredentials(updatedCredentials);
		setShowAddCredential(false);

		// Auto-save
		setTimeout(() => saveCredentials(updatedCredentials), 100);
		toast.success("Credencial adicionada com sucesso");
	};

	const updateCredential = async () => {
		if (!editingCredential) return;

		const updatedCredentials = credentials.map((cred) =>
			cred.id === editingCredential.id
				? { ...editingCredential, updatedAt: new Date().toISOString() }
				: cred,
		);

		setCredentials(updatedCredentials);
		setEditingCredential(null);

		// Auto-save
		setTimeout(() => saveCredentials(updatedCredentials), 100);
		toast.success("Credencial atualizada com sucesso");
	};

	const deleteCredential = async (id: string) => {
		if (!confirm("Tem certeza que deseja excluir esta credencial?")) return;

		const updatedCredentials = credentials.filter((cred) => cred.id !== id);
		setCredentials(updatedCredentials);

		// Auto-save
		setTimeout(() => saveCredentials(updatedCredentials), 100);
		toast.success("Credencial excluída com sucesso");
	};

	const copyToClipboard = async (text: string, type: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success(`${type} copiado para a área de transferência`);
		} catch (_) {
			toast.error("Erro ao copiar para área de transferência");
		}
	};

	const togglePasswordVisibility = (id: string) => {
		setShowPasswords((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	// Filtrar credenciais
	const filteredCredentials = credentials.filter((cred) => {
		const matchesSearch =
			searchTerm === "" ||
			cred.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			cred.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
			cred.url.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesCategory =
			selectedCategory === "all" || cred.category === selectedCategory;

		return matchesSearch && matchesCategory;
	});

	// Salvar configurações
	const saveSettings = async () => {
		try {
			await storageManager.current?.saveSettings(settings);
			applyTheme(settings.theme);
			setShowSettings(false);
			toast.success("Configurações salvas com sucesso");
		} catch (_) {
			toast.error("Erro ao salvar configurações");
		}
	};

	// Renderização condicional para modo não suportado
	if (typeof window !== "undefined" && !isFileSystemAccessSupported) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<Card className="w-full max-w-2xl">
					<CardHeader className="text-center">
						<Vault className="w-12 h-12 text-primary mx-auto mb-4" />
						<CardTitle>Erro de Compatibilidade</CardTitle>
						<CardDescription className="space-y-4">
							<div className="space-y-3">
								<p>
									Este navegador não suporta a File System Access API necessária
									para o funcionamento completo.
								</p>
								<div className="bg-muted p-4 rounded-lg text-left">
									<p className="font-medium mb-2">Navegadores suportados:</p>
									<ul className="text-sm space-y-1">
										<li>• Chrome 86+</li>
										<li>• Edge 86+</li>
										<li>• Opera 72+</li>
										<li>• Brave (versões recentes)</li>
									</ul>
								</div>
							</div>
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{!isVaultOpen ? (
				<div className="min-h-screen max-w-md mx-auto flex items-center">
					<Card className="mx-4">
						<CardHeader className="text-center">
							<Vault className="w-16 h-16 text-primary mx-auto mb-4" />
							<CardTitle className="text-2xl">
								Cofre de Senhas Pessoal
							</CardTitle>
							<CardDescription>
								Gerencie suas senhas de forma segura
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<Button
								className="w-full"
								onClick={() => setShowCreateVault(true)}
							>
								<Plus className="w-4 h-4 mr-2" />
								Criar Novo Cofre
							</Button>

							<Button
								variant="outline"
								className="w-full"
								onClick={() => setShowOpenVault(true)}
							>
								<FolderOpen className="w-4 h-4 mr-2" />
								Abrir Cofre Existente
							</Button>
						</CardContent>
					</Card>
				</div>
			) : (
				<>
					{/* Header */}
					<header className="border-b bg-card">
						<div className="container mx-auto px-4 py-4 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Vault className="w-12 h-12 text-primary" />
								<div>
									<h1 className="hidden sm:inline text-xl font-bold">
										Cofre de Senhas Pessoal
									</h1>
									<h1 className="inline sm:hidden text-xl font-bold">CSP</h1>
									<p className="text-sm text-muted-foreground flex items-center gap-2">
										Nome: {vaultData?.name}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowOpenVault(true)}
								>
									<FolderOpen className="w-4 h-4" />
									<span className="hidden md:inline">Trocar de Cofre</span>
								</Button>
								<Button variant="outline" size="sm" onClick={lockVault}>
									<Lock className="w-4 h-4" />
									<span className="hidden md:inline">Bloquear Cofre Atual</span>
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowSettings(true)}
								>
									<SettingsIcon className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</header>

					<main className="container mx-auto px-4 py-6">
						{/* Interface principal do cofre */}
						<div className="space-y-6">
							{/* Barra de pesquisa e filtros */}

							<div className="flex flex-col sm:flex-row gap-4">
								<div className="flex-1 relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
									<Input
										placeholder="Pesquisar credenciais..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										maxLength={50}
									/>
								</div>

								<Select
									value={selectedCategory}
									onValueChange={setSelectedCategory}
								>
									<SelectTrigger className="w-full sm:w-48">
										<SelectValue placeholder="Categoria" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Todas as categorias</SelectItem>
										{categories.map((category) => (
											<SelectItem key={category} value={category}>
												{category}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Button
									onClick={() => {
										setShowAddCredential(true);
										setNewCredential({
											name: "",
											username: "",
											password: "",
											url: "",
											notes: "",
											category: "",
										});
									}}
								>
									<Plus className="w-4 h-4 mr-2" />
									Adicionar
								</Button>
							</div>

							{/* Lista de credenciais */}
							<div className="grid gap-4">
								{!filteredCredentials.length ? (
									<Card>
										<CardContent className="pt-6 text-center">
											<Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
											<p className="text-muted-foreground">
												{credentials.length === 0
													? "Nenhuma credencial cadastrada ainda"
													: "Nenhuma credencial encontrada com os filtros aplicados"}
											</p>
										</CardContent>
									</Card>
								) : (
									filteredCredentials.map((credential) => (
										<Card key={credential.id}>
											<CardHeader className="p-4 pl-6 border-b">
												<div className="flex justify-between items-center">
													<div className="flex gap-3">
														<h3 className="font-semibold text-lg">
															{credential.name}
														</h3>
														<Badge variant="secondary">
															{credential.category}
														</Badge>
													</div>
													<div className="flex gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => setEditingCredential(credential)}
														>
															<Edit className="w-4 h-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => deleteCredential(credential.id)}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													</div>
												</div>
											</CardHeader>
											<CardContent className="px-6 py-4">
												<div className="flex items-start justify-between">
													<div className="flex-1 space-y-3">
														<div className="grid gap-2 text-sm">
															<div className="flex items-center gap-2">
																<User className="w-4 h-4 text-muted-foreground" />
																<span className="font-medium">Usuário:</span>
																<span className="font-mono">
																	{credential.username}
																</span>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		copyToClipboard(
																			credential.username,
																			"Usuário",
																		)
																	}
																>
																	<Copy className="w-3 h-3" />
																</Button>
															</div>

															<div className="flex items-center gap-2">
																<Key className="w-4 h-4 text-muted-foreground" />
																<span className="font-medium">Senha:</span>
																<span className="font-mono">
																	{showPasswords[credential.id]
																		? credential.password
																		: "•".repeat(credential.password.length)}
																</span>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		togglePasswordVisibility(credential.id)
																	}
																>
																	{showPasswords[credential.id] ? (
																		<EyeOff className="w-3 h-3" />
																	) : (
																		<Eye className="w-3 h-3" />
																	)}
																</Button>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		copyToClipboard(
																			credential.password,
																			"Senha",
																		)
																	}
																>
																	<Copy className="w-3 h-3" />
																</Button>
															</div>

															{credential.url && (
																<div className="flex items-center gap-2">
																	<Globe className="w-4 h-4 text-muted-foreground" />
																	<span className="font-medium">URL:</span>
																	<a
																		href={
																			credential.url.startsWith("http")
																				? credential.url
																				: `https://${credential.url}`
																		}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="text-primary underline"
																	>
																		{credential.url}
																	</a>
																	<Button
																		variant="ghost"
																		size="sm"
																		onClick={() =>
																			copyToClipboard(credential.url, "URL")
																		}
																	>
																		<Copy className="w-3 h-3" />
																	</Button>
																</div>
															)}

															{credential.notes && (
																<div className="flex items-center gap-2 h-9 w-full min-w-0">
																	<StickyNote className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
																	<span className="font-medium flex-shrink-0">
																		Observações:
																	</span>
																	<span className="text-muted-foreground truncate overflow-hidden whitespace-nowrap flex-1">
																		{credential.notes}
																	</span>
																</div>
															)}
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									))
								)}
							</div>
						</div>
					</main>
				</>
			)}

			{/* Dialog: Criar Novo Cofre */}
			<CreateVault
				showCreateVault={showCreateVault}
				setShowCreateVault={setShowCreateVault}
				vaultName={vaultName}
				setVaultName={setVaultName}
				masterPassword={masterPassword}
				setMasterPassword={setMasterPassword}
				createNewVault={createNewVault}
				loading={loading}
			/>

			{/* Dialog: Abrir Cofre Existente */}
			<OpenVault
				showOpenVault={showOpenVault}
				setShowOpenVault={setShowOpenVault}
				masterPassword={masterPassword}
				setMasterPassword={setMasterPassword}
				openExistingVault={openExistingVault}
				loading={loading}
			/>

			{/* Dialog: Adicionar Credencial */}
			<AddCredential
				showAddCredential={showAddCredential}
				setShowAddCredential={setShowAddCredential}
				newCredential={newCredential}
				setNewCredential={setNewCredential}
				addCredential={addCredential}
				categories={categories}
			/>

			{/* Dialog: Editar Credencial */}
			<EditCredential
				editingCredential={editingCredential}
				setEditingCredential={setEditingCredential}
				updateCredential={updateCredential}
				categories={categories}
			/>

			{/* Dialog: Configurações */}
			<Settings
				showSettings={showSettings}
				setShowSettings={setShowSettings}
				settings={settings}
				setSettings={setSettings}
				saveSettings={saveSettings}
			/>
		</div>
	);
}
