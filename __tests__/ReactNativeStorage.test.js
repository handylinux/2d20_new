/**
 * React Native-specific storage tests for CharacterManager
 * Tests FileSystem behavior and edge cases
 */

describe('React Native Storage - Edge Cases', () => {
  const mockFileSystem = {};
  
  beforeAll(() => {
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
        if (mockFileSystem[path] !== undefined) {
          return Promise.resolve(mockFileSystem[path]);
        }
        return Promise.reject(new Error('File not found'));
      }),
      writeAsStringAsync: jest.fn((path, content) => {
        mockFileSystem[path] = content;
        return Promise.resolve();
      }),
      deleteAsync: jest.fn((path) => {
        if (mockFileSystem[path] !== undefined) {
          delete mockFileSystem[path];
          return Promise.resolve();
        }
        return Promise.reject(new Error('File not found'));
      })
    };
    
    global.__DEV__ = true;
    global.__dirname = '/mock/dir';
  });

  beforeEach(() => {
    Object.keys(mockFileSystem).forEach(key => delete mockFileSystem[key]);
    jest.clearAllMocks();
  });

  test('should handle special characters in character name', async () => {
    const { saveCharacter, loadCharacter, sanitizeFileName } = require('../components/CharacterManager');
    
    const specialName = 'Test:Character<With>Special"Chars';
    const sanitized = sanitizeFileName(specialName);
    
    expect(sanitized).not.toContain(':');
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
    expect(sanitized).not.toContain('"');
    
    const characterData = { name: specialName, level: 1 };
    const result = await saveCharacter(characterData);
    
    expect(result.success).toBe(true);
    
    const loaded = await loadCharacter(sanitized);
    expect(loaded.success).toBe(true);
    expect(loaded.data.name).toBe(specialName);
  });

  test('should handle very long character names', async () => {
    const { saveCharacter, loadCharacter, sanitizeFileName } = require('../components/CharacterManager');
    
    const longName = 'A'.repeat(250);
    const sanitized = sanitizeFileName(longName);
    
    expect(sanitized.length).toBeLessThanOrEqual(200);
    
    const characterData = { name: longName, level: 1 };
    const result = await saveCharacter(characterData);
    
    expect(result.success).toBe(true);
    
    const loaded = await loadCharacter(sanitized);
    expect(loaded.success).toBe(true);
  });

  test('should handle Unicode characters in character name', async () => {
    const { saveCharacter, loadCharacter } = require('../components/CharacterManager');
    
    const unicodeName = 'Супер-Персонаж-123';
    
    const characterData = { name: unicodeName, level: 1 };
    const result = await saveCharacter(characterData);
    
    expect(result.success).toBe(true);
    
    const loaded = await loadCharacter(unicodeName);
    expect(loaded.success).toBe(true);
    expect(loaded.data.name).toBe(unicodeName);
  });

  test('should handle empty character data', async () => {
    const { saveCharacter, loadCharacter } = require('../components/CharacterManager');
    
    const result = await saveCharacter({});
    
    expect(result.success).toBe(true);
    
    const loaded = await loadCharacter('unnamed_character');
    expect(loaded.success).toBe(true);
  });

  test('should handle character with null/undefined fields', async () => {
    const { saveCharacter, loadCharacter } = require('../components/CharacterManager');
    
    const characterData = {
      name: 'Partial Character',
      origin: null,
      attributes: undefined,
      level: 1
    };
    
    const result = await saveCharacter(characterData);
    
    expect(result.success).toBe(true);
    
    const loaded = await loadCharacter('Partial_Character');
    expect(loaded.success).toBe(true);
    expect(loaded.data.name).toBe('Partial Character');
  });

  test('should handle file system write errors', async () => {
    const { saveCharacter } = require('../components/CharacterManager');
    
    // Mock write error
    const originalWrite = FileSystem.writeAsStringAsync;
    FileSystem.writeAsStringAsync = jest.fn(() => {
      return Promise.reject(new Error('Disk full'));
    });
    
    const characterData = { name: 'Full Character', level: 1 };
    const result = await saveCharacter(characterData);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Disk full');
    
    // Restore
    FileSystem.writeAsStringAsync = originalWrite;
  });

  test('should handle file system read errors', async () => {
    const { loadCharacter } = require('../components/CharacterManager');
    
    const filePath = '/mock/document/directory/chars/Test_Character.json';
    FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: true });
    FileSystem.readAsStringAsync.mockRejectedValueOnce(new Error('Permission denied'));
    
    const result = await loadCharacter('Test Character');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Permission denied');
  });

  test('should handle file system delete errors', async () => {
    const { deleteCharacter } = require('../components/CharacterManager');
    
    const filePath = '/mock/document/directory/chars/Test_Character.json';
    FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: true });
    FileSystem.deleteAsync.mockRejectedValueOnce(new Error('Permission denied'));
    
    const result = await deleteCharacter('Test Character');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Permission denied');
  });

  test('should handle missing directory gracefully', async () => {
    const { listCharacters } = require('../components/CharacterManager');
    
    FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: false });
    
    const characters = await listCharacters();
    
    expect(characters).toHaveLength(0);
  });

  test('should create intermediate directories when saving', async () => {
    const { saveCharacter } = require('../components/CharacterManager');
    
    FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: false });
    FileSystem.makeDirectoryAsync.mockResolvedValueOnce();
    
    const characterData = { name: 'Nested Character', level: 1 };
    const result = await saveCharacter(characterData);
    
    expect(result.success).toBe(true);
    expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
      expect.stringContaining('chars/'),
      { intermediates: true }
    );
  });

  test('should preserve all character attributes during save/load cycle', async () => {
    const { saveCharacter, loadCharacter } = require('../components/CharacterManager');
    
    const characterData = {
      name: 'Complete Character',
      origin: { id: '1', name: 'Child of Atom', description: 'Test', image: 'test.png' },
      trait: { name: 'Test Trait', modifiers: { strength: 2 } },
      attributes: [
        { name: 'СИЛ', value: 5 },
        { name: 'ВОС', value: 6 },
        { name: 'ИНТ', value: 7 },
        { name: 'ЧТ', value: 8 },
        { name: 'ЛК', value: 9 },
        { name: 'ЭФ', value: 10 },
        { name: 'КР', value: 1 }
      ],
      skills: [
        { name: 'Стрельба', value: 50 },
        { name: 'Кунг-фу', value: 40 }
      ],
      selectedSkills: ['Стрельба', 'Кунг-фу', 'Медицина'],
      extraTaggedSkills: ['Лидерство'],
      forcedSelectedSkills: [],
      level: 20,
      equipment: { items: [{ id: '1', name: 'Laser Pistol', damage: 20 }] },
      effects: [],
      equippedWeapons: [{ id: '1' }, null],
      equippedArmor: {
        head: { armor: { id: '2', name: 'Helmet', armor: 5 }, clothing: null },
        body: { armor: { id: '3', name: 'Armor', armor: 10 }, clothing: null }
      },
      caps: 1000,
      currentHealth: 150,
      maxHealth: 200,
      luckPoints: 10,
      maxLuckPoints: 15,
      attributesSaved: true,
      skillsSaved: true,
      selectedPerks: [{ id: '1', name: 'Better Criticals' }],
      modifiedItems: { '1': { damageBonus: 5 } },
      carryWeight: 500,
      meleeBonus: 10,
      initiative: 20,
      defense: 5
    };
    
    const result = await saveCharacter(characterData);
    expect(result.success).toBe(true);
    
    const loaded = await loadCharacter('Complete_Character');
    expect(loaded.success).toBe(true);
    
    // Verify all data preserved
    expect(loaded.data.name).toBe('Complete Character');
    expect(loaded.data.origin.name).toBe('Child of Atom');
    expect(loaded.data.attributes[0].value).toBe(5);
    expect(loaded.data.level).toBe(20);
    expect(loaded.data.equipment.items[0].name).toBe('Laser Pistol');
    expect(loaded.data.selectedPerks[0].name).toBe('Better Criticals');
  });
});
