import type { Profile, EncryptedData } from './types';
import { encrypt, decrypt, getOrCreateKey } from './crypto';

const STORAGE_KEYS = {
  PROFILE: 'encrypted_profile',
  ENCRYPTION_KEY: 'encryption_key',
  FIELD_MAPPINGS: 'field_mappings',
} as const;

export async function saveProfile(profile: Profile): Promise<void> {
  const key = await getOrCreateKey();
  const encrypted = await encrypt(JSON.stringify(profile), key);
  await chrome.storage.local.set({ [STORAGE_KEYS.PROFILE]: encrypted });
}

export async function getProfile(): Promise<Profile | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.PROFILE);
  const encrypted = result[STORAGE_KEYS.PROFILE] as EncryptedData | undefined;

  if (!encrypted) {
    return null;
  }

  try {
    const key = await getOrCreateKey();
    const decrypted = await decrypt(encrypted, key);
    return JSON.parse(decrypted) as Profile;
  } catch (error) {
    console.error('Failed to decrypt profile:', error);
    return null;
  }
}

export async function clearProfile(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEYS.PROFILE);
}

export async function exportProfile(): Promise<string> {
  const profile = await getProfile();
  if (!profile) {
    throw new Error('No profile to export');
  }
  return JSON.stringify(profile, null, 2);
}

export async function importProfile(jsonString: string): Promise<void> {
  const profile = JSON.parse(jsonString) as Profile;
  await saveProfile(profile);
}

export type FieldMapping = {
  domain: string;
  fieldId: string;
  profileKey: string;
};

export async function saveFieldMapping(mapping: FieldMapping): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.FIELD_MAPPINGS);
  const mappings = (result[STORAGE_KEYS.FIELD_MAPPINGS] as FieldMapping[]) || [];

  const existingIndex = mappings.findIndex(
    m => m.domain === mapping.domain && m.fieldId === mapping.fieldId
  );

  if (existingIndex >= 0) {
    mappings[existingIndex] = mapping;
  } else {
    mappings.push(mapping);
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.FIELD_MAPPINGS]: mappings });
}

export async function getFieldMappings(domain: string): Promise<FieldMapping[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.FIELD_MAPPINGS);
  const mappings = (result[STORAGE_KEYS.FIELD_MAPPINGS] as FieldMapping[]) || [];
  return mappings.filter(m => m.domain === domain);
}
