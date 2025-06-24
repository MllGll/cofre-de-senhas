// Gerenciamento do cofre de senhas usando File System Access API

import type { Credential } from "@/types";
import { CryptoManager } from "./crypto";

export interface VaultFile {
	version: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	data: string; // Dados criptografados
}

export class VaultManager {
	private static readonly FILE_EXTENSION = ".vault";
	private static readonly VAULT_VERSION = "1.0";

	/**
	 * Cria um novo cofre
	 */
	async createVault(
		name: string,
		masterPassword: string,
	): Promise<FileSystemFileHandle> {
		try {
			// Solicitar local para salvar o arquivo
			const fileHandle = await window.showSaveFilePicker({
				suggestedName: `${name}${VaultManager.FILE_EXTENSION}`,
				types: [
					{
						description: "Arquivo de Cofre de Senhas",
						accept: {
							"application/vault": [VaultManager.FILE_EXTENSION],
						},
					},
				],
			});

			// Criar estrutura inicial do cofre
			const initialData: Credential[] = [];
			const encryptedData = await CryptoManager.encrypt(
				JSON.stringify(initialData),
				masterPassword,
			);

			const vaultFile: VaultFile = {
				version: VaultManager.VAULT_VERSION,
				name: name,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				data: encryptedData,
			};

			// Salvar arquivo
			const writable = await fileHandle.createWritable();
			await writable.write(JSON.stringify(vaultFile, null, 2));
			await writable.close();

			return fileHandle;
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				throw new Error("Operação cancelada pelo usuário");
			}
			throw new Error(
				`Erro ao criar cofre: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	/**
	 * Abre um cofre existente
	 */
	async openVault(masterPassword: string): Promise<{
		name: string;
		credentials: Credential[];
		handle: FileSystemFileHandle;
	}> {
		try {
			// Solicitar arquivo para abrir
			const [fileHandle] = await window.showOpenFilePicker({
				types: [
					{
						description: "Arquivo de Cofre de Senhas",
						accept: {
							"application/vault": [VaultManager.FILE_EXTENSION],
						},
					},
				],
			});

			// Ler arquivo
			const file = await fileHandle.getFile();
			const content = await file.text();

			// Parse do JSON
			let vaultFile: VaultFile;
			try {
				vaultFile = JSON.parse(content);
			} catch {
				throw new Error("Arquivo de cofre inválido ou corrompido");
			}

			// Verificar versão
			if (!vaultFile.version || !vaultFile.data) {
				throw new Error("Formato de arquivo não suportado");
			}

			// Descriptografar dados
			const decryptedData = await CryptoManager.decrypt(
				vaultFile.data,
				masterPassword,
			);

			let credentials: Credential[];
			try {
				credentials = JSON.parse(decryptedData);
			} catch {
				throw new Error("Dados do cofre corrompidos");
			}

			// Validar estrutura dos dados
			if (!Array.isArray(credentials)) {
				throw new Error("Estrutura de dados inválida");
			}

			return {
				name: vaultFile.name,
				credentials,
				handle: fileHandle,
			};
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				throw new Error("Operação cancelada pelo usuário");
			}
			throw error;
		}
	}

	/**
	 * Salva credenciais no cofre
	 */
	async saveCredentials(
		fileHandle: FileSystemFileHandle,
		credentials: Credential[],
		masterPassword: string,
	): Promise<void> {
		try {
			// Ler arquivo atual para preservar metadados
			const file = await fileHandle.getFile();
			const content = await file.text();
			const vaultFile: VaultFile = JSON.parse(content);

			// Criptografar novos dados
			const encryptedData = await CryptoManager.encrypt(
				JSON.stringify(credentials),
				masterPassword,
			);

			// Atualizar arquivo
			const updatedVaultFile: VaultFile = {
				...vaultFile,
				data: encryptedData,
				updatedAt: new Date().toISOString(),
			};

			// Salvar
			const writable = await fileHandle.createWritable();
			await writable.write(JSON.stringify(updatedVaultFile, null, 2));
			await writable.close();
		} catch (error) {
			throw new Error(
				`Erro ao salvar credenciais: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}
}
