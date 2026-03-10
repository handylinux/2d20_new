# Design Document

## Overview

Система управления персонажами для Fallout (2d20) включает:
1. **Start Screen** - сетка персонажей с ячейкой создания нового
2. **Character Screen** - экран создания/редактирования с полем имени и кнопкой сохранения
3. **File Storage** - сохранение данных в JSON файлы в `components/chars/`

## Architecture

```
StartScreen (Grid of characters)
    └── New Character Cell (+)
    └── Character Cells (name + thumbnail)

CharacterScreen
    ├── Name Input (top, enables save button)
    ├── Character Editor (disabled until save)
    │   ├── Origin selection
    │   ├── Trait selection
    │   ├── Equipment selection
    │   └── Level control
    └── Save Button (bottom, enables editing)
```

## Components and Interfaces

### StartScreen Component
- Displays 4-column grid
- Cell 1:1 is "New Character" with dashed border, + symbol
- Other cells show saved characters (thumbnail + name)
- Pressing "New Character" loads CharacterScreen
- Pressing character cell loads that character's data

### CharacterScreen Component
- Name input field at top (text input)
- Save button at bottom (disabled until name entered)
- All other fields disabled until save
- After save: enables editing, writes to file in real-time

### CharacterManager Utility
- `saveCharacter(characterData)` - save to `components/chars/{name}.json`
- `loadCharacter(name)` - load from file
- `listCharacters()` - list all saved characters
- `deleteCharacter(name)` - remove character file
- `sanitizeFileName(name)` - sanitize character name for safe file naming

## Data Models

### Character Data Structure
```json
{
  "name": "Character Name",
  "savedAt": "ISO timestamp",
  "origin": { "id": "...", "name": "...", "description": "...", "image": "..." },
  "trait": { "name": "...", "modifiers": { ... } },
  "attributes": [
    { "name": "СИЛ", "value": 5 },
    { "name": "ВОС", "value": 5 },
    { "name": "ИНТ", "value": 5 },
    { "name": "ЧТ", "value": 5 },
    { "name": "ЛК", "value": 5 },
    { "name": "ЭФ", "value": 5 },
    { "name": "КР", "value": 5 }
  ],
  "skills": [
    { "name": "Стрельба", "value": 0 },
    { "name": "Кунг-фу", "value": 0 },
    ...
  ],
  "selectedSkills": ["Стрельба", "Кунг-фу", "Медицина"],
  "extraTaggedSkills": [],
  "forcedSelectedSkills": [],
  "level": 1,
  "equipment": { "items": [...] },
  "effects": [],
  "equippedWeapons": [null, null],
  "equippedArmor": {
    "head": { "armor": null, "clothing": null },
    "body": { "armor": null, "clothing": null },
    ...
  },
  "caps": 0,
  "currentHealth": 20,
  "maxHealth": 20,
  "luckPoints": 5,
  "maxLuckPoints": 5,
  "attributesSaved": true,
  "skillsSaved": true,
  "selectedPerks": [],
  "modifiedItems": { ... },
  "carryWeight": 200,
  "meleeBonus": 0,
  "initiative": 0,
  "defense": 1
}
```

## Error Handling

- Invalid filename characters in character name → show error
- File write failure → show error message
- File read failure → show error message, fallback to empty state

## Testing Strategy

1. **Unit Tests**
   - CharacterManager save/load functions
   - Filename sanitization
   - Grid layout calculations

2. **Integration Tests**
   - Create character → verify file created
   - Edit character → verify file updated
   - Load character → verify data restored

3. **UI Tests**
   - Name field enables save button
   - Save button enables editing
   - Grid displays saved characters

## Platform Considerations

### React Native (Mobile)
- Use `FileSystem` API for file storage
- Storage path: `FileSystem.documentDirectory + 'chars/'`

### Web (Browser)
- Use `localStorage` or `IndexedDB` for file storage
- Simulate file system with key-value storage

## File Storage Implementation

### Directory Structure
```
components/
  chars/
    {character_name}.json
```

### File Format
```json
{
  "name": "CharacterName",
  "savedAt": "2026-03-10T...",
  "origin": { "id": "...", "name": "...", "description": "...", "image": "..." },
  "trait": { "name": "...", "modifiers": { ... } },
  "attributes": [
    { "name": "СИЛ", "value": 5 },
    { "name": "ВОС", "value": 5 },
    { "name": "ИНТ", "value": 5 },
    { "name": "ЧТ", "value": 5 },
    { "name": "ЛК", "value": 5 },
    { "name": "ЭФ", "value": 5 },
    { "name": "КР", "value": 5 }
  ],
  "skills": [
    { "name": "Стрельба", "value": 0 },
    { "name": "Кунг-фу", "value": 0 },
    ...
  ],
  "selectedSkills": ["Стрельба", "Кунг-фу", "Медицина"],
  "extraTaggedSkills": [],
  "forcedSelectedSkills": [],
  "level": 1,
  "equipment": { "items": [...] },
  "effects": [],
  "equippedWeapons": [null, null],
  "equippedArmor": {
    "head": { "armor": null, "clothing": null },
    "body": { "armor": null, "clothing": null },
    ...
  },
  "caps": 0,
  "currentHealth": 20,
  "maxHealth": 20,
  "luckPoints": 5,
  "maxLuckPoints": 5,
  "attributesSaved": true,
  "skillsSaved": true,
  "selectedPerks": [],
  "modifiedItems": { ... },
  "carryWeight": 200,
  "meleeBonus": 0,
  "initiative": 0,
  "defense": 1
}
```
