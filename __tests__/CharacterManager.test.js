/**
 * Cross-platform compatibility tests for CharacterManager
 * Tests file storage on both React Native and Web platforms
 */

import { sanitizeFileName, saveCharacter, loadCharacter, listCharacters, deleteCharacter, getCharacterInfo, setupRealTimeSaving } from '../components/CharacterManager';

// Mock localStorage for testing
const mockLocalStorage = {};
global.localStorage = {
  getItem: jest.fn((key) => mockLocalStorage[key] || null),
  setItem: jest.fn((key, value) => { mockLocalStorage[key] = value; }),
  removeItem: jest.fn((key) => { delete mockLocalStorage[key]; }),
  key: jest.fn((index) => Object.keys(mockLocalStorage)[index] || null),
  get length() { return Object.keys(mockLocalStorage).length; },
  clear: jest.fn(() => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); })
};

// Mock FileSystem for React Native
const mockFileSystem = {};
global.FileSystem = {
  documentDirectory: '/mock/document/directory/',
  getInfoAsync: jest.fn((path) => {
    const exists = mockFileSystem[path] !== undefined;
    return Promise.resolve({ exists, isDirectory: !exists });
  }),
  makeDirectoryAsync: jest.fn((path, options) => {
    mockFileSystem[path] = { type: 'directory' };
    return Promise.resolve();
  }),
  readDirectoryAsync: jest.fn((path) => {
    const files = [];
    Object.keys(mockFileSystem).forEach(key => {
      if (key.startsWith(path) && !mockFileSystem[key].isDirectory) {
        files.push(key.replace(path, ''));
      }
    });
    return Promise.resolve(files);
  }),
  readAsStringAsync: jest.fn((path) => {
    if (mockFileSystem[path]) {
      return Promise.resolve(mockFileSystem[path]);
    }
    return Promise.reject(new Error('File not found'));
  }),
  writeAsStringAsync: jest.fn((path, content) => {
    mockFileSystem[path] = content;
    return Promise.resolve();
  }),
  deleteAsync: jest.fn((path) => {
    if (mockFileSystem[path]) {
      delete mockFileSystem[path];
      return Promise.resolve();
    }
    return Promise.reject(new Error('File not found'));
  })
};

describe('CharacterManager - Cross-Platform Compatibility', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockLocalStorage.clear();
    Object.keys(mockFileSystem).forEach(key => delete mockFileSystem[key]);
    jest.clearAllMocks();
  });

  describe('sanitizeFileName', () => {
    test('should handle valid names', () => {
      expect(sanitizeFileName('John Doe')).toBe('John_Doe');
      expect(sanitizeFileName('Test-Character_123')).toBe('Test-Character_123');
    });

    test('should sanitize invalid characters', () => {
      expect(sanitizeFileName('John<Doe>')).toBe('John_Doe_');
      expect(sanitizeFileName('Test:Name')).toBe('Test_Name');
      expect(sanitizeFileName('Bad/Name\\Here')).toBe('Bad_Name_Here');
    });

    test('should handle empty and null inputs', () => {
      expect(sanitizeFileName('')).toBe('unnamed_character');
      expect(sanitizeFileName(null)).toBe('unnamed_character');
      expect(sanitizeFileName(undefined)).toBe('unnamed_character');
    });

    test('should trim whitespace', () => {
      expect(sanitizeFileName('  John Doe  ')).toBe('John_Doe');
    });

    test('should limit length', () => {
      const longName = 'A'.repeat(300);
      const sanitized = sanitizeFileName(longName);
      expect(sanitized.length).toBeLessThanOrEqual(200);
    });
  });

  describe('Web Platform (localStorage)', () => {
    beforeEach(() => {
      // Simulate web environment
      global.__DEV__ = false;
      global.__dirname = undefined;
    });

    test('should save character to localStorage', async () => {
      const characterData = {
        name: 'Test Character',
        origin: { id: '1', name: 'Child of Atom', description: 'Test', image: 'test.png' },
        attributes: [{ name: 'СИЛ', value: 5 }],
        level: 1
      };

      const result = await saveCharacter(characterData);
      
      expect(result.success).toBe(true);
      expect(result.path).toContain('fallout_char_');
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    test('should load character from localStorage', async () => {
      const characterData = {
        name: 'Test Character',
        origin: { id: '1', name: 'Child of Atom', description: 'Test', image: 'test.png' },
        attributes: [{ name: 'СИЛ', value: 5 }],
        level: 1,
        savedAt: '2026-03-10T00:00:00.000Z'
      };

      localStorage.setItem('fallout_char_Test_Character', JSON.stringify(characterData));

      const result = await loadCharacter('Test Character');
      
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Test Character');
    });

    test('should list all saved characters', async () => {
      const char1 = { name: 'Character 1', savedAt: '2026-03-10T00:00:00.000Z' };
      const char2 = { name: 'Character 2', savedAt: '2026-03-10T00:00:00.000Z' };

      localStorage.setItem('fallout_char_Character_1', JSON.stringify(char1));
      localStorage.setItem('fallout_char_Character_2', JSON.stringify(char2));
      localStorage.setItem('other_key', 'should_not_be_listed');

      const characters = await listCharacters();
      
      expect(characters).toHaveLength(2);
      expect(characters).toContain('Character 1');
      expect(characters).toContain('Character 2');
    });

    test('should delete character from localStorage', async () => {
      const characterData = { name: 'Delete Me', savedAt: '2026-03-10T00:00:00.000Z' };
      localStorage.setItem('fallout_char_Delete_Me', JSON.stringify(characterData));

      const result = await deleteCharacter('Delete Me');
      
      expect(result.success).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith('fallout_char_Delete_Me');
    });

    test('should get character info', async () => {
      const characterData = { 
        name: 'Info Character', 
        savedAt: '2026-03-10T00:00:00.000Z' 
      };
      localStorage.setItem('fallout_char_Info_Character', JSON.stringify(characterData));

      const info = await getCharacterInfo('Info Character');
      
      expect(info).not.toBeNull();
      expect(info.name).toBe('Info Character');
      expect(info.savedAt).toBe('2026-03-10T00:00:00.000Z');
    });

    test('should handle non-existent character', async () => {
      const result = await loadCharacter('Non Existent');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Character not found');
    });
  });

  describe('React Native Platform (FileSystem)', () => {
    beforeEach(() => {
      // Simulate React Native environment
      global.__DEV__ = true;
      global.__dirname = '/mock/dir';
    });

    test('should save character to FileSystem', async () => {
      const characterData = {
        name: 'RN Character',
        origin: { id: '1', name: 'Child of Atom', description: 'Test', image: 'test.png' },
        attributes: [{ name: 'СИЛ', value: 5 }],
        level: 1
      };

      const result = await saveCharacter(characterData);
      
      expect(result.success).toBe(true);
      expect(result.path).toContain('/mock/document/directory/chars/');
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
    });

    test('should create directory if it does not exist', async () => {
      const characterData = { name: 'New Dir Character', level: 1 };
      
      // First call should create directory
      FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: false });
      FileSystem.makeDirectoryAsync.mockResolvedValueOnce();

      const result = await saveCharacter(characterData);
      
      expect(result.success).toBe(true);
      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalled();
    });

    test('should load character from FileSystem', async () => {
      const characterData = {
        name: 'RN Character',
        origin: { id: '1', name: 'Child of Atom', description: 'Test', image: 'test.png' },
        attributes: [{ name: 'СИЛ', value: 5 }],
        level: 1,
        savedAt: '2026-03-10T00:00:00.000Z'
      };

      const filePath = '/mock/document/directory/chars/RN_Character.json';
      FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: true });
      FileSystem.readAsStringAsync.mockResolvedValueOnce(JSON.stringify(characterData));

      const result = await loadCharacter('RN Character');
      
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('RN Character');
    });

    test('should list all saved characters', async () => {
      const dirPath = '/mock/document/directory/chars/';
      FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: true });
      FileSystem.readDirectoryAsync.mockResolvedValueOnce([
        'Character1.json',
        'Character2.json',
        'not_a_char.txt'
      ]);

      const characters = await listCharacters();
      
      expect(characters).toHaveLength(2);
      expect(characters).toContain('Character1');
      expect(characters).toContain('Character2');
    });

    test('should handle empty directory', async () => {
      FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: false });

      const characters = await listCharacters();
      
      expect(characters).toHaveLength(0);
    });

    test('should delete character from FileSystem', async () => {
      const filePath = '/mock/document/directory/chars/Delete_Me.json';
      FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: true });

      const result = await deleteCharacter('Delete Me');
      
      expect(result.success).toBe(true);
      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(filePath);
    });

    test('should handle non-existent character', async () => {
      FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: false });

      const result = await loadCharacter('Non Existent');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Character file not found');
    });
  });

  describe('Real-time saving', () => {
    beforeEach(() => {
      global.__DEV__ = false;
      global.__dirname = undefined;
    });

    test('should set up real-time saving on web', () => {
      const characterData = { name: 'Realtime Test', level: 1 };
      const cleanup = setupRealTimeSaving('Realtime Test', characterData);
      
      expect(cleanup).toBeFunction();
      cleanup();
    });

    test('should clean up real-time saving', () => {
      const characterData = { name: 'Cleanup Test', level: 1 };
      const cleanup = setupRealTimeSaving('Cleanup Test', characterData);
      
      cleanup();
      // Should not throw
    });
  });
});
