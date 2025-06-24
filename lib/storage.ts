// Gerenciamento do IndexedDB para configurações locais

import type { AppSettings } from "@/types";

export class StorageManager {
	private dbName = "PasswordVaultDB";
	private dbVersion = 1;
	private db: IDBDatabase | null = null;

	constructor() {
		this.initDB();
	}

	/**
	 * Inicializa o banco IndexedDB
	 */
	private async initDB(): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);

			request.onerror = () => {
				reject(new Error("Erro ao abrir IndexedDB"));
			};

			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				// Store para configurações
				if (!db.objectStoreNames.contains("settings")) {
					db.createObjectStore("settings", { keyPath: "id" });
				}

				// Store para cache de handles de arquivos
				if (!db.objectStoreNames.contains("fileHandles")) {
					db.createObjectStore("fileHandles", { keyPath: "id" });
				}
			};
		});
	}

	/**
	 * Salva as configurações do aplicativo
	 */
	async saveSettings(settings: AppSettings): Promise<void> {
		if (!this.db) await this.initDB();

		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error("Banco não inicializado"));
				return;
			}

			const transaction = this.db.transaction(["settings"], "readwrite");
			const store = transaction.objectStore("settings");

			const settingsData = {
				id: "appSettings",
				...settings,
			};

			const request = store.put(settingsData);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(new Error("Erro ao salvar configurações"));
		});
	}

	/**
	 * Carrega as configurações do aplicativo
	 */
	async getSettings(): Promise<AppSettings | null> {
		if (!this.db) await this.initDB();

		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error("Banco não inicializado"));
				return;
			}

			const transaction = this.db.transaction(["settings"], "readonly");
			const store = transaction.objectStore("settings");
			const request = store.get("appSettings");

			request.onsuccess = () => {
				const result = request.result;
				console.log({ result });

				if (result) {
					resolve({
						theme: result.theme || "system",
						lockTimeout: result.lockTimeout ?? 5,
					});
				} else {
					resolve(null);
				}
			};

			request.onerror = () =>
				reject(new Error("Erro ao carregar configurações"));
		});
	}
}
