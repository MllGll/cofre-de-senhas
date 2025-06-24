// Funções de criptografia usando Web Crypto API nativa

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class CryptoManager {
	private static readonly ALGORITHM = "AES-GCM";
	private static readonly KEY_LENGTH = 256;
	private static readonly IV_LENGTH = 12;
	private static readonly SALT_LENGTH = 16;
	private static readonly ITERATIONS = 100000;

	/**
	 * Deriva uma chave AES a partir de uma senha usando PBKDF2
	 */
	static async deriveKey(
		password: string,
		salt: Uint8Array,
	): Promise<CryptoKey> {
		const encoder = new TextEncoder();
		const passwordBuffer = encoder.encode(password);

		// Importar a senha como chave base
		const baseKey = await crypto.subtle.importKey(
			"raw",
			passwordBuffer,
			"PBKDF2",
			false,
			["deriveKey"],
		);

		// Derivar a chave AES
		const derivedKey = await crypto.subtle.deriveKey(
			{
				name: "PBKDF2",
				salt: salt,
				iterations: CryptoManager.ITERATIONS,
				hash: "SHA-256",
			},
			baseKey,
			{
				name: CryptoManager.ALGORITHM,
				length: CryptoManager.KEY_LENGTH,
			},
			false,
			["encrypt", "decrypt"],
		);

		return derivedKey;
	}

	/**
	 * Criptografa dados usando AES-256-GCM
	 */
	static async encrypt(data: string, password: string): Promise<string> {
		try {
			const encoder = new TextEncoder();
			const dataBuffer = encoder.encode(data);

			// Gerar salt e IV aleatórios
			const salt = crypto.getRandomValues(
				new Uint8Array(CryptoManager.SALT_LENGTH),
			);
			const iv = crypto.getRandomValues(
				new Uint8Array(CryptoManager.IV_LENGTH),
			);

			// Derivar chave
			const key = await CryptoManager.deriveKey(password, salt);

			// Criptografar
			const encryptedBuffer = await crypto.subtle.encrypt(
				{
					name: CryptoManager.ALGORITHM,
					iv: iv,
				},
				key,
				dataBuffer,
			);

			// Combinar salt + iv + dados criptografados
			const encryptedArray = new Uint8Array(encryptedBuffer);
			const result = new Uint8Array(
				salt.length + iv.length + encryptedArray.length,
			);

			result.set(salt, 0);
			result.set(iv, salt.length);
			result.set(encryptedArray, salt.length + iv.length);

			// Converter para base64
			return btoa(String.fromCharCode(...result));
		} catch (error) {
			throw new Error(
				`Erro na criptografia: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	/**
	 * Descriptografa dados usando AES-256-GCM
	 */
	static async decrypt(
		encryptedData: string,
		password: string,
	): Promise<string> {
		try {
			// Converter de base64
			const encryptedBuffer = Uint8Array.from(atob(encryptedData), (c) =>
				c.charCodeAt(0),
			);

			// Extrair salt, IV e dados criptografados
			const salt = encryptedBuffer.slice(0, CryptoManager.SALT_LENGTH);
			const iv = encryptedBuffer.slice(
				CryptoManager.SALT_LENGTH,
				CryptoManager.SALT_LENGTH + CryptoManager.IV_LENGTH,
			);
			const encrypted = encryptedBuffer.slice(
				CryptoManager.SALT_LENGTH + CryptoManager.IV_LENGTH,
			);

			// Derivar chave
			const key = await CryptoManager.deriveKey(password, salt);

			// Descriptografar
			const decryptedBuffer = await crypto.subtle.decrypt(
				{
					name: CryptoManager.ALGORITHM,
					iv: iv,
				},
				key,
				encrypted,
			);

			// Converter para string
			const decoder = new TextDecoder();
			return decoder.decode(decryptedBuffer);
		} catch (error) {
			if (error instanceof Error && error.name === "OperationError") {
				throw new Error("Senha incorreta ou dados corrompidos");
			}
			throw new Error(
				`Erro na descriptografia: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	/**
	 * Calcula hash SHA-256 de uma string
	 */
	static async hash(data: string): Promise<string> {
		const encoder = new TextEncoder();
		const dataBuffer = encoder.encode(data);
		const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
		const hashArray = new Uint8Array(hashBuffer);
		return btoa(String.fromCharCode(...hashArray));
	}
}
