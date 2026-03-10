import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// --- Filename sanitization ---
const sanitizeFilename = (name) => {
  if (!name || typeof name !== 'string') return 'unnamed';
  
  // Remove or replace invalid characters for filenames
  // Keep letters, numbers, spaces, hyphens, underscores, and Unicode chars
  return name
    .replace(/[<>:"|?*]/g, '_')  // Replace invalid Windows chars
    .replace(/\//g, '-')          // Replace forward slashes
    .replace(/\\+/g, '-')         // Replace backslashes
    .trim() || 'unnamed';
};

// --- Platform-specific storage paths ---
const getStoragePath = () => {
  if (Platform.OS === 'web') {
    return 'character_manager';
  }
  return `${FileSystem.documentDirectory}character_manager/`;
};

const getCharacterFilePath = (name) => {
  const safeName = sanitizeFilename(name);
  if (Platform.OS === 'web') {
    return `character_${safeName}.json`;
  }
  return `${getStoragePath()}character_${safeName}.json`;
};

// --- Web storage (localStorage) ---
const webGetCharacters = () => {
  const characters = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('character_') && key.endsWith('.json')) {
      const name = key.replace('character_', '').replace('.json', '');
      characters.push(name);
    }
  }
  return characters;
};

const webSaveCharacter = async (name, data) => {
  try {
    const key = `character_${sanitizeFilename(name)}.json`;
    localStorage.setItem(key, JSON.stringify(data));
    return { success: true, filename: key };
  } catch (error) {
    console.error('[CharacterManager] Web save error:', error);
    return { success: false, error: error.message };
  }
};

const webLoadCharacter = async (name) => {
  try {
    const key = `character_${sanitizeFilename(name)}.json`;
    const data = localStorage.getItem(key);
    if (data === null) {
      return { success: false, error: 'Character not found' };
    }
    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    console.error('[CharacterManager] Web load error:', error);
    return { success: false, error: error.message };
  }
};

const webDeleteCharacter = async (name) => {
  try {
    const key = `character_${sanitizeFilename(name)}.json`;
    localStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    console.error('[CharacterManager] Web delete error:', error);
    return { success: false, error: error.message };
  }
};

// --- React Native storage (FileSystem) ---
const ensureDirectoryExists = async () => {
  const dir = getStoragePath();
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
};

const rnGetCharacters = async () => {
  await ensureDirectoryExists();
  const dir = getStoragePath();
  const dirInfo = await FileSystem.getInfoAsync(dir);
  
  if (!dirInfo.exists) {
    return [];
  }
  
  const files = await FileSystem.readDirectoryAsync(dir);
  return files
    .filter(f => f.startsWith('character_') && f.endsWith('.json'))
    .map(f => f.replace('character_', '').replace('.json', ''));
};

const rnSaveCharacter = async (name, data) => {
  await ensureDirectoryExists();
  try {
    const filePath = getCharacterFilePath(name);
    const json = JSON.stringify(data, null, 2);
    await FileSystem.writeAsStringAsync(filePath, json);
    return { success: true, filename: filePath };
  } catch (error) {
    console.error('[CharacterManager] RN save error:', error);
    return { success: false, error: error.message };
  }
};

const rnLoadCharacter = async (name) => {
  await ensureDirectoryExists();
  try {
    const filePath = getCharacterFilePath(name);
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    
    if (!fileInfo.exists) {
      return { success: false, error: 'Character not found' };
    }
    
    const json = await FileSystem.readAsStringAsync(filePath);
    return { success: true, data: JSON.parse(json) };
  } catch (error) {
    console.error('[CharacterManager] RN load error:', error);
    return { success: false, error: error.message };
  }
};

const rnDeleteCharacter = async (name) => {
  await ensureDirectoryExists();
  try {
    const filePath = getCharacterFilePath(name);
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    
    if (!fileInfo.exists) {
      return { success: false, error: 'Character not found' };
    }
    
    await FileSystem.deleteAsync(filePath);
    return { success: true };
  } catch (error) {
    console.error('[CharacterManager] RN delete error:', error);
    return { success: false, error: error.message };
  }
};

// --- Real-time saving management ---
let saveTimeouts = new Map();

const cleanupRealTimeSaving = () => {
  saveTimeouts.forEach((timeoutId, key) => {
    clearTimeout(timeoutId);
  });
  saveTimeouts.clear();
};

const scheduleRealTimeSave = async (name, data, delay = 1000) => {
  // Cancel existing timeout for this character
  const existingTimeout = saveTimeouts.get(name);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }
  
  // Schedule new save
  const timeoutId = setTimeout(async () => {
    const result = await saveCharacter(name, data);
    if (!result.success) {
      console.error(`[CharacterManager] Real-time save failed for ${name}:`, result.error);
    }
  }, delay);
  
  saveTimeouts.set(name, timeoutId);
};

// --- Public API ---
export const CharacterManager = {
  // Save character data to file
  saveCharacter: async (name, data) => {
    if (Platform.OS === 'web') {
      return await webSaveCharacter(name, data);
    }
    return await rnSaveCharacter(name, data);
  },
  
  // Load character data from file
  loadCharacter: async (name) => {
    if (Platform.OS === 'web') {
      return await webLoadCharacter(name);
    }
    return await rnLoadCharacter(name);
  },
  
  // List all saved characters
  listCharacters: async () => {
    if (Platform.OS === 'web') {
      return await webGetCharacters();
    }
    return await rnGetCharacters();
  },
  
  // Delete a character file
  deleteCharacter: async (name) => {
    if (Platform.OS === 'web') {
      return await webDeleteCharacter(name);
    }
    return await rnDeleteCharacter(name);
  },
  
  // Cleanup function to call when resetting character
  cleanupRealTimeSaving,
  
  // Schedule automatic save after delay (for real-time saving)
  scheduleRealTimeSave,
  
  // Helper: sanitize filename
  sanitizeFilename,
};

export default CharacterManager;
