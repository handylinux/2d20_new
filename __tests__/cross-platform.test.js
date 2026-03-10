/**
 * Cross-platform compatibility tests for CharacterManager
 * Tests both React Native and Web storage implementations
 */

describe('CharacterManager - Cross-Platform Compatibility', () => {
  let CharacterManager;
  let originalWindow;
  let originalLocalStorage;
  let originalFileSystem;
  let originalDev;
  let originalDirname;
  
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    
    // Store original values
    originalWindow = global.window;
    originalLocalStorage = global.localStorage;
    originalFileSystem = global.FileSystem;
    originalDev = global.__DEV__;
    originalDirname = global.__dirname;
  });
  
  afterEach(() => {
    // Restore original values
    global.window = originalWindow;
    global.localStorage = originalLocalStorage;
    global.FileSystem = originalFileSystem;
    global.__DEV__ = originalDev;
    global.__dirname = originalDirname;
  });
  
  describe('Web Platform Tests', () => {
    beforeAll(() => {
      // Mock web environment
      global.window = { document: {} };
      global.localStorage = {
        store: {},
        getItem: jest.fn((key) => {
          return this.store[key] || null;
        }),
        setItem: jest.fn((key, value) => {
          this.store[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete this.store[key];
        }),
        key: jest.fn((index) => {
          return Object.keys(this.store)[index] || null;
        }),
        get length() {
          return Object.keys(this.store).length;
        },
        clear: jest.fn(() => {
          Object.keys(this.store).forEach(k => delete this.store[k]);
        })
      };
    });
    
    afterAll(() => {
      delete global.window;
      delete global.localStorage;
    });
    
    test('should save character on web platform', async () => {
      CharacterManager = require('../components/CharacterManager');
      
      const characterData = {
        name: 'Test Character',
        level: 1,
        origin: { id: '1', name: 'Test Origin' }
      };
      
      const result = await CharacterManager.saveCharacter(characterData);
      
      expect(result.success).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalled();
    });
    
    test('should load character on web platform', async () => {
      CharacterManager = require('../components/CharacterManager');
      
      // First save
      const characterData = {
        name: 'Load Test',
        level: 5,
        origin: { id: '2', name: 'Load Origin' }
      };
      await CharacterManager.saveCharacter(characterData);
      
      // Then load
      const result = await CharacterManager.loadCharacter('Load Test');
      
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Load Test');
      expect(result.data.level).toBe(5);
    });
    
    test('should list characters on web platform', async () => {
      CharacterManager = require('../components/CharacterManager');
      
      // Save multiple characters
      await CharacterManager.saveCharacter({ name: 'Char1', level: 1 });
      await CharacterManager.saveCharacter({ name: 'Char2', level: 2 });
      await CharacterManager.saveCharacter({ name: 'Char3', level: 3 });
      
      const characters = await CharacterManager.listCharacters();
      
      expect(characters).toHaveLength(3);
      expect(characters).toContain('Char1');
      expect(characters).toContain('Char2');
      expect(characters).toContain('Char3');
    });
    
    test('should delete character on web platform', async () => {
      CharacterManager = require('../components/CharacterManager');
      
      // Save then delete
      await CharacterManager.saveCharacter({ name: 'Delete Me', level: 1 });
      const deleteResult = await CharacterManager.deleteCharacter('Delete Me');
      
      expect(deleteResult.success).toBe(true);
      
      // Verify it's gone
      const loadResult = await CharacterManager.loadCharacter('Delete Me');
      expect(loadResult.success).toBe(false);
    });
    
    test('should handle special characters in names on web', async () => {
      CharacterManager = require('../components/CharacterManager');
      
      const specialName = 'Test:Character<With>Special"Chars';
      const characterData = { name: specialName, level: 1 };
      
      const result = await CharacterManager.saveCharacter(characterData);
      
      expect(result.success).toBe(true);
      
      const loaded = await CharacterManager.loadCharacter(specialName);
      expect(loaded.success).toBe(true);
    });
    
    test('should handle Unicode characters on web', async () => {
      CharacterManager = require('../components/CharacterManager');
      
      const unicodeName = 'Супер-Персонаж-123';
      const characterData = { name: unicodeName, level: 1 };
      
      const result = await CharacterManager.saveCharacter(characterData);
      
      expect(result.success).toBe(true);
      
      const loaded = await CharacterManager.loadCharacter(unicodeName);
      expect(loaded.success).toBe(true);
      expect(loaded.data.name).toBe(unicodeName);
    });
    
    test('should preserve all character attributes on web', async () => {
      CharacterManager = require('../components/CharacterManager');
      
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
      
      const saveResult = await CharacterManager.saveCharacter(characterData);
      expect(saveResult.success).toBe(true);
      
      const loadResult = await CharacterManager.loadCharacter('Complete_Character');
      expect(loadResult.success).toBe(true);
      
      // Verify all data preserved
      expect(loadResult.data.name).toBe('Complete Character');
      expect(loadResult.data.origin.name).toBe('Child of Atom');
      expect(loadResult.data.attributes[0].value).toBe(5);
      expect(loadResult.data.level).toBe(20);
      expect(loadResult.data.equipment.items[0].name).toBe('Laser Pistol');
      expect(loadResult.data.selectedPerks[0].name).toBe('Better Criticals');
    });
  });
  
  describe('React Native Platform Tests', () => {
    beforeAll(() => {
      // Mock React Native environment
      delete global.window;
      
      global.FileSystem = {
        documentDirectory: '/mock/document/directory/',
        getInfoAsync: jest.fn((path) => {
          if (!this.mockFileSystem) this.mockFileSystem = {};
          const exists = this.mockFileSystem[path] !== undefined;
          return Promise.resolve({ exists, isDirectory: !exists });
        }),
        makeDirectoryAsync: jest.fn((path, options) => {
          if (!this.mockFileSystem) this.mockFileSystem = {};
          this.mockFileSystem[path] = { type: 'directory' };
          return Promise.resolve();
        }),
        readDirectoryAsync: jest.fn((path) => {
          if (!this.mockFileSystem) this.mockFileSystem = {};
          const files = [];
          Object.keys(this.mockFileSystem).forEach(key => {
            if (key.startsWith(path) && !this.mockFileSystem[key].isDirectory) {
              files.push(key.replace(path, ''));
            }
          });
          return Promise.resolve(files);
        }),
        readAsStringAsync: jest.fn((path) => {
          if (!this.mockFileSystem) this.mockFileSystem = {};
          if (this.mockFileSystem[path] !== undefined) {
            return Promise.resolve(this.mockFileSystem[path]);
          }
          return Promise.reject(new Error('File not found'));
        }),
        writeAsStringAsync: jest.fn((path, content) => {
          if (!this.mockFileSystem) this.mockFileSystem = {};
          this.mockFileSystem[path] = content;
          return Promise.resolve();
        }),
        deleteAsync: jest.fn((path) => {
          if (!this.mockFileSystem) this.mockFileSystem = {};
          if (this.mockFileSystem[path] !== undefined) {
            delete this.mockFileSystem[path];
            return Promise.resolve();
          }
          return Promise.reject(new Error('File not found'));
        })
      };
      
      global.__DEV__ = true;
      global.__dirname = '/mock/dir';
    });
    
    afterAll(() => {
      delete global.FileSystem;
      delete global.__DEV__;
      delete global.__dirname;
    });
    
    beforeEach(() => {
      // Clear mock file system before each test
      if (global.FileSystem && global.FileSystem.mockFileSystem) {
        Object.keys(global.FileSystem.mockFileSystem).forEach(key => {
          delete global.FileSystem.mockFileSystem[key];
        });
      }
      jest.clearAllMocks();
    });
    
    test('should save character on React Native platform', async () => {
      CharacterManager = require('../components/CharacterManager');
      
      const characterData = {
        name: 'RN Test Character',
        level: 1,
        origin: { id: '1', name: 'Test Origin' }
      };
      
      const result = await CharacterManager.saveCharacter(characterData);
      
      expect(result.success).toBe(true);
      expect(global.FileSystem.writeAsStringAsync).toHaveBeenCalled();
    });
    
    test('should load character on React Native platform', async () => {
      CharacterManager = require('../components/CharacterManager');
      
      // First save
      const characterData = {
        name: 'RN Load Test',
        level: 5,
        origin: { id: '2', name: 'Load Origin' }
      };
      await CharacterManager.saveCharacter(characterData);
      
      // Then load
      const result = await CharacterManager.loadCharacter('RN Load Test');
      
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('RN Load Test');
      expect(result.data.level).toBe(5);
    });
    
    test('should list characters on React Native platform', async () => {
      CharacterManager = require('../components/CharacterManager');
      
      // Save multiple characters
      await CharacterManager.saveCharacter({ name: 'RN Char1', level: 1 });
      await CharacterManager.saveCharacter({ name: 'RN Char2', level: 2 });
      await CharacterManager.saveCharacter({ name: 'RN Char3', level: 3 });
      
      const characters = await CharacterManager.listCharacters();
      
      expect(characters).toHaveLength(3);
      expect(characters).toContain('RN Char1');
      expect(characters).toContain('RN Char2');
      expect(characters).toContain('RN Char3');
    });
    
    test('should delete character on React Native platform', async () => {
      CharacterManager = require('../components/CharacterManager');
      
      // Save then delete
      await CharacterManager.saveCharacter({ name: 'RN Delete Me', level: 1 });
      const deleteResult = await CharacterManager.deleteCharacter('RN Delete Me');
      
      expect(deleteResult.success).toBe(true);
      
      // Verify it's gone
      const loadResult = await CharacterManager.loadCharacter('RN Delete Me');
      expect(loadResult.success).toBe(false);
    });
    
    test('should handle special characters in names on React Native', async () => {
      CharacterManager = require('../components/CharacterManager');
      
      const specialName = 'RN Test:Character<With>Special"Chars';
      const characterData = { name: specialName, level: 1 };
      
      const result = await CharacterManager.saveCharacter(characterData);
      
      expect(result.success).toBe(true);
      
      const loaded = await CharacterManager.loadCharacter(specialName);
      expect(loaded.success).toBe(true);
    });
    
    test('should handle Unicode characters on React Native', async () => {
      CharacterManager = require('../components/CharacterManager');
      
      const unicodeName = 'RN Супер-Персонаж-123';
      const characterData = { name: unicodeName, level: 1 };
      
      const result = await CharacterManager.saveCharacter(characterData);
      
      expect(result.success).toBe(true);
      
      const loaded = await CharacterManager.loadCharacter(unicodeName);
      expect(loaded.success).toBe(true);
      expect(loaded.data.name).toBe(unicodeName);
    });
    
    test('should preserve all character attributes on React Native', async () => {
      CharacterManager = require('../components/CharacterManager');
      
      const characterData = {
        name: 'RN Complete Character',
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
      
      const saveResult = await CharacterManager.saveCharacter(characterData);
      expect(saveResult.success).toBe(true);
      
      const loadResult = await CharacterManager.loadCharacter('RN Complete_Character');
      expect(loadResult.success).toBe(true);
      
      // Verify all data preserved
      expect(loadResult.data.name).toBe('RN Complete Character');
      expect(loadResult.data.origin.name).toBe('Child of Atom');
      expect(loadResult.data.attributes[0].value).toBe(5);
      expect(loadResult.data.level).toBe(20);
      expect(loadResult.data.equipment.items[0].name).toBe('Laser Pistol');
      expect(loadResult.data.selectedPerks[0].name).toBe('Better Criticals');
    });
  });
  
  describe('Cross-Platform Data Compatibility', () => {
    test('should save/load character data in same format on both platforms', async () => {
      CharacterManager = require('../components/CharacterManager');
      
      const characterData = {
        name: 'Cross Platform Character',
        level: 15,
        origin: { id: '1', name: 'Test Origin' },
        attributes: [{ name: 'СИЛ', value: 7 }],
        caps: 500
      };
      
      // Save on web
      global.window = { document: {} };
      global.localStorage = {
        store: {},
        getItem: jest.fn((key) => this.store[key] || null),
        setItem: jest.fn((key, value) => { this.store[key] = value; }),
        removeItem: jest.fn((key) => { delete this.store[key]; }),
        key: jest.fn((index) => Object.keys(this.store)[index] || null),
        get length() { return Object.keys(this.store).length; },
        clear: jest.fn(() => { Object.keys(this.store).forEach(k => delete this.store[k]); })
      };
      
      const webSaveResult = await CharacterManager.saveCharacter(characterData);
      expect(webSaveResult.success).toBe(true);
      
      // Load from web
      const webLoadResult = await CharacterManager.loadCharacter('Cross Platform Character');
      expect(webLoadResult.success).toBe(true);
      
      // Verify data structure
      expect(webLoadResult.data.name).toBe('Cross Platform Character');
      expect(webLoadResult.data.level).toBe(15);
      expect(webLoadResult.data.origin.name).toBe('Test Origin');
      expect(webLoadResult.data.attributes[0].value).toBe(7);
      expect(webLoadResult.data.caps).toBe(500);
      expect(webLoadResult.data.savedAt).toBeDefined();
    });
  });
});
