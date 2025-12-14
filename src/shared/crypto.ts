import type { EncryptedData } from './types';

const ENCRYPTION_KEY_STORAGE = 'encryption_key';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

async function importKey(keyData: string): Promise<CryptoKey> {
  const buffer = base64ToArrayBuffer(keyData);
  return await crypto.subtle.importKey(
    'raw',
    buffer,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function getOrCreateKey(): Promise<CryptoKey> {
  const result = await chrome.storage.local.get(ENCRYPTION_KEY_STORAGE);
  const storedKey = result[ENCRYPTION_KEY_STORAGE] as string | undefined;

  if (storedKey) {
    return await importKey(storedKey);
  }

  const newKey = await generateKey();
  const exported = await exportKey(newKey);
  await chrome.storage.local.set({ [ENCRYPTION_KEY_STORAGE]: exported });
  return newKey;
}

export async function encrypt(data: string, key: CryptoKey): Promise<EncryptedData> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(data);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoded
  );

  return {
    iv: arrayBufferToBase64(iv.buffer),
    data: arrayBufferToBase64(encrypted),
  };
}

export async function decrypt(encryptedData: EncryptedData, key: CryptoKey): Promise<string> {
  const iv = base64ToArrayBuffer(encryptedData.iv);
  const data = base64ToArrayBuffer(encryptedData.data);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
}
