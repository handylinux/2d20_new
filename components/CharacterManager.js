/**
 * CharacterManager - Utility for managing character files
 * Supports both React Native (FileSystem) and Web (localStorage)
 */

const STORAGE_DIR = 'chars/';
const WEB_STORAGE_PREFIX = 'fallout_char_';

// Track which characters have active real-time listeners
const realTimeListeners = new Map();

/**
 * Sanitize character name for safe file naming
 * Removes/replaces characters that are invalid in filenames
 */
export function sanitizeFileName(name) {
  if (!name || typeof name !== 'string') {
    return 'unnamed_character';
  }
  
  // Trim whitespace
  let sanitized = name.trim();
  
  // Replace invalid characters with underscores
  // Invalid chars: < > : " / \ | ? * and control characters
  sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  
  // Replace multiple spaces with single space
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Replace spaces with underscores for file naming
  sanitized = sanitized.replace(/\s+/g, '_');
  
  // Remove leading/trailing underscores
  sanitized = sanitized.replace(/^_+|_+$/g, '');
  
  // Fallback if empty after sanitization
  if (!sanitized) {
    sanitized = 'unnamed_character';
  }
  
  // Limit length (filesystems often have 255 char limit)
  sanitized = sanitized.substring(0, 200);
  
  return sanitized;
}

/**
 * Get storage path based on platform
 */
function getStoragePath() {
  if (__DEV__ && typeof __dirname !== 'undefined') {
    // React Native environment
    return `${__dirname}/${STORAGE_DIR}`;
  }
  return STORAGE_DIR;
}

/**
 * Check if running on web platform
 */
function isWeb() {
  return typeof window !== 'undefined' && window.document !== undefined;
}

/**
 * Get file path for a character
 */
function getCharacterFilePath(name) {
  const sanitized = sanitizeFileName(name);
  return `${sanitized}.json`;
}

/**
 * Save character data to file
 * @param {Object} characterData - Character data to save
 * @returns {Promise<Object>} - { success: boolean, path: string, error?: string }
 */
export async function saveCharacter(characterData) {
  try {
    const name = characterData.name || 'unnamed_character';
    const filePath = getCharacterFilePath(name);
    
    if (isWeb()) {
      // Web platform - use localStorage
      const storageKey = `${WEB_STORAGE_PREFIX}${sanitizeFileName(name)}`;
      const dataToStore = {
        ...characterData,
        savedAt: new Date().toISOString(),
        _storageKey: storageKey
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToStore));
      return { success: true, path: storageKey };
    } else {
      // React Native - use FileSystem
      const FileSystem = require('expo-file-system');
      const dirPath = `${FileSystem.documentDirectory}${STORAGE_DIR}`;
      
      // Ensure directory exists
      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
      }
      
      const fullPath = `${dirPath}${filePath}`;
      const jsonString = JSON.stringify({
        ...characterData,
        savedAt: new Date().toISOString()
      }, null, 2);
      
      await FileSystem.writeAsStringAsync(fullPath, jsonString);
      return { success: true, path: fullPath };
    }
  } catch (error) {
    console.error('Error saving character:', error);
    return { 
      success: false, 
      path: '', 
      error: error.message || 'Failed to save character' 
    };
  }
}

/**
 * Load character data from file
 * @param {string} name - Character name
 * @returns {Promise<Object>} - { success: boolean, data?: Object, error?: string }
 */
export async function loadCharacter(name) {
  try {
    const filePath = getCharacterFilePath(name);
    
    if (isWeb()) {
      // Web platform - use localStorage
      const storageKey = `${WEB_STORAGE_PREFIX}${sanitizeFileName(name)}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (!storedData) {
        return { success: false, error: 'Character not found' };
      }
      
      const data = JSON.parse(storedData);
      return { success: true, data };
    } else {
      // React Native - use FileSystem
      const FileSystem = require('expo-file-system');
      const fullPath = `${FileSystem.documentDirectory}${STORAGE_DIR}${filePath}`;
      
      const fileInfo = await FileSystem.getInfoAsync(fullPath);
      if (!fileInfo.exists) {
        return { success: false, error: 'Character file not found' };
      }
      
      const jsonString = await FileSystem.readAsStringAsync(fullPath);
      const data = JSON.parse(jsonString);
      return { success: true, data };
    }
  } catch (error) {
    console.error('Error loading character:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to load character' 
    };
  }
}

/**
 * List all saved characters
 * @returns {Promise<Array>} - Array of character names
 */
export async function listCharacters() {
  try {
    if (isWeb()) {
      // Web platform - scan localStorage
      const characters = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(WEB_STORAGE_PREFIX)) {
          const name = key.replace(WEB_STORAGE_PREFIX, '');
          characters.push(name);
        }
      }
      return characters;
    } else {
      // React Native - scan directory
      const FileSystem = require('expo-file-system');
      const dirPath = `${FileSystem.documentDirectory}${STORAGE_DIR}`;
      
      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      if (!dirInfo.exists) {
        return [];
      }
      
      const files = await FileSystem.readDirectoryAsync(dirPath);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    }
  } catch (error) {
    console.error('Error listing characters:', error);
    return [];
  }
}

/**
 * Delete a character file
 * @param {string} name - Character name to delete
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export async function deleteCharacter(name) {
  try {
    const filePath = getCharacterFilePath(name);
    
    if (isWeb()) {
      // Web platform - remove from localStorage
      const storageKey = `${WEB_STORAGE_PREFIX}${sanitizeFileName(name)}`;
      localStorage.removeItem(storageKey);
      return { success: true };
    } else {
      // React Native - delete file
      const FileSystem = require('expo-file-system');
      const fullPath = `${FileSystem.documentDirectory}${STORAGE_DIR}${filePath}`;
      
      const fileInfo = await FileSystem.getInfoAsync(fullPath);
      if (!fileInfo.exists) {
        return { success: false, error: 'Character file not found' };
      }
      
      await FileSystem.deleteAsync(fullPath);
      return { success: true };
    }
  } catch (error) {
    console.error('Error deleting character:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to delete character' 
    };
  }
}

/**
 * Check if a character exists
 * @param {string} name - Character name
 * @returns {Promise<boolean>} - true if character exists
 */
export async function characterExists(name) {
  const result = await loadCharacter(name);
  return result.success;
}

/**
 * Get character info (name and save date)
 * @param {string} name - Character name
 * @returns {Promise<Object|null>} - Character info or null if not found
 */
export async function getCharacterInfo(name) {
  const result = await loadCharacter(name);
  if (result.success && result.data) {
    return {
      name: result.data.name || name,
      savedAt: result.data.savedAt || null
    };
  }
  return null;
}

/**
 * Set up real-time file saving for a character
 * Automatically saves to file whenever characterData changes
 * @param {string} name - Character name (used for file naming)
 * @param {Object} characterData - Character data object to monitor
 * @param {Function} onSaveCallback - Optional callback when save completes
 * @returns {Function} - Cleanup function to stop real-time saving
 */
export function setupRealTimeSaving(name, characterData, onSaveCallback) {
  if (isWeb()) {
    // Web platform - use localStorage
    const storageKey = `${WEB_STORAGE_PREFIX}${sanitizeFileName(name)}`;
    
    // Create a deep copy watcher for real-time updates
    let lastSavedData = null;
    
    const watcher = () => {
      // Check if data has changed (shallow check first, then deep if needed)
      const currentData = {
        ...characterData,
        savedAt: new Date().toISOString(),
        _storageKey: storageKey
      };
      
      // Simple deep comparison (could be optimized)
      const needsUpdate = JSON.stringify(currentData) !== JSON.stringify(lastSavedData);
      
      if (needsUpdate) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(currentData));
          lastSavedData = JSON.parse(JSON.stringify(currentData));
          if (onSaveCallback) onSaveCallback(currentData);
        } catch (error) {
          console.error('Error saving character to localStorage:', error);
        }
      }
    };
    
    // Set up interval-based watching (since we can't observe object changes directly in JS)
    const intervalId = setInterval(watcher, 500); // Check every 500ms
    
    // Store listener for cleanup
    realTimeListeners.set(storageKey, { type: 'web', intervalId, storageKey });
    
    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      realTimeListeners.delete(storageKey);
    };
  } else {
    // React Native - use FileSystem
    const FileSystem = require('expo-file-system');
    const dirPath = `${FileSystem.documentDirectory}${STORAGE_DIR}`;
    
    // Ensure directory exists
    FileSystem.getInfoAsync(dirPath).then(dirInfo => {
      if (!dirInfo.exists) {
        FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
      }
    });
    
    const filePath = getCharacterFilePath(name);
    const fullPath = `${dirPath}${filePath}`;
    
    let lastSavedData = null;
    
    const watcher = () => {
      const currentData = {
        ...characterData,
        savedAt: new Date().toISOString()
      };
      
      const needsUpdate = JSON.stringify(currentData) !== JSON.stringify(lastSavedData);
      
      if (needsUpdate) {
        try {
          const jsonString = JSON.stringify(currentData, null, 2);
          FileSystem.writeAsStringAsync(fullPath, jsonString);
          lastSavedData = JSON.parse(jsonString);
          if (onSaveCallback) onSaveCallback(currentData);
        } catch (error) {
          console.error('Error saving character to file:', error);
        }
      }
    };
    
    // Set up interval-based watching
    const intervalId = setInterval(watcher, 500);
    
    // Store listener for cleanup
    realTimeListeners.set(fullPath, { type: 'native', intervalId, fullPath });
    
    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      realTimeListeners.delete(fullPath);
    };
  }
}

/**
 * Clean up all real-time saving listeners
 */
export function cleanupRealTimeSaving() {
  realTimeListeners.forEach(({ intervalId }) => {
    clearInterval(intervalId);
  });
  realTimeListeners.clear();
}
