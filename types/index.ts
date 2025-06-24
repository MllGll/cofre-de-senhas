// Definições de tipos TypeScript

export interface Credential {
	id: string;
	name: string;
	username: string;
	password: string;
	url: string;
	notes: string;
	category: string;
	createdAt: string;
	updatedAt: string;
}

export interface AppSettings {
	theme: "light" | "dark" | "system";
	lockTimeout: number; // em minutos, 0 = desabilitado
}

export interface VaultData {
	name: string;
	handle: FileSystemFileHandle;
}

export interface SearchFilters {
	searchTerm: string;
	category: string;
	sortBy: "name" | "category" | "createdAt" | "updatedAt";
	sortOrder: "asc" | "desc";
}

export interface PasswordStrength {
	score: number;
	feedback: string[];
	level: "weak" | "fair" | "good" | "strong";
}

export interface ExportData {
	exportedAt: string;
	version: string;
	vaultName: string;
	credentialsCount: number;
	credentials: Credential[];
}

export interface ImportResult {
	success: boolean;
	imported: number;
	skipped: number;
	errors: string[];
	credentials: Credential[];
}

// Tipos para eventos do sistema
export interface VaultEvent {
	type: "created" | "opened" | "locked" | "saved" | "error";
	timestamp: string;
	message?: string;
	data?: any;
}

// Configurações de segurança
export interface SecuritySettings {
	requirePasswordOnWake: boolean;
	clearClipboardAfter: number; // segundos
	maxFailedAttempts: number;
	lockOnMinimize: boolean;
}

// Estatísticas do cofre
export interface VaultStats {
	totalCredentials: number;
	categoriesCount: number;
	lastModified: string;
	weakPasswords: number;
	duplicatePasswords: number;
	oldPasswords: number; // senhas não alteradas há mais de X dias
}
