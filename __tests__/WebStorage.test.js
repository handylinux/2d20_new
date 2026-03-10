/**
 * Web-specific storage tests for CharacterManager
 * Tests localStorage behavior and edge cases
 */

describe('Web Storage - Edge Cases', () => {
  const mockLocalStorage = {};
  
  beforeAll(() => {
    global.localStorage = {
      getItem: jest.fn((key) => mockLocalStorage[key] || null),
      setItem: jest.fn((key, value) => { mockLocalStorage[key] = value; }),
      removeItem: jest.fn((key) => { delete mockLocalStorage[key]; }),
      key: jest.fn((index) => Object.keys(mockLocalStorage)[index] || null),
      get length() { return Object.keys(mockLocalStorage).length; },
      clear: jest.fn(() => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); })
    };
    
    global.__DEV__ = false;
    global.__dirname = undefined;
  });

  beforeEach(() => {
    mockLocalStorage.clear();
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

  test('should handle localStorage quota exceeded', async () => {
    const { saveCharacter } = require('../components/CharacterManager');
    
    // Mock quota exceeded error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    });
    
    const characterData = { name: 'Full Character', level: 1 };
    const result = await saveCharacter(characterData);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    
    // Restore
    localStorage.setItem = originalSetItem;
  });

  test('should handle special characters in origin image path', async () => {
    const { saveCharacter, loadCharacter } = require('../components/CharacterManager');
    
    const characterData = {
      name: 'Image Test',
      origin: {
        id: '1',
        name: 'Child of Atom',
        description: 'Test with "quotes" and <tags>',
        image: 'path/to/image with spaces.png'
      },
      level: 1
    };
    
    const result = await saveCharacter(characterData);
    
    expect(result.success).toBe(true);
    
    const loaded = await loadCharacter('Image_Test');
    expect(loaded.success).toBe(true);
    expect(loaded.data.origin.description).toContain('quotes');
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
