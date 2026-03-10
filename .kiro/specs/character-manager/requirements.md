# Requirements Document

## Introduction

Система управления персонажами для ролевой игры Fallout (2d20). Включает стартовый экран с сеткой персонажей, экран создания/редактирования персонажа с полем имени и механизмом сохранения в файлы.

## Requirements

### Requirement 1: Character Screen - Name Field and Save Button

**User Story:** As a player, I want to enter my character's name at the top of the character creation screen, so that I can identify my character before saving.

#### Acceptance Criteria

1. WHEN the Character Screen loads THEN the first text input field SHALL be labeled "Имя:" (Name:)
2. IF the name field contains at least 1 character THEN the "Сохранить персонажа" (Save Character) button at the bottom of the screen SHALL become active
3. IF the name field is empty THEN the "Сохранить персонажа" button SHALL be disabled (grayed out)
4. WHEN the name field has content but the save button is NOT yet pressed THEN all other character creation fields (origin, trait, equipment, level) SHALL be disabled (grayed out, not editable)
5. WHEN the "Сохранить персонажа" button is pressed THEN a character file SHALL be created and all character attribute changes SHALL be written to this file in real-time

### Requirement 2: Character Screen - Real-time File Saving

**User Story:** As a player, I want my character data to be saved to a file in real-time after initial save, so that I don't lose progress if the app crashes.

#### Acceptance Criteria

1. WHEN the "Сохранить персонажа" button is pressed for the first time THEN the system SHALL create a character file in the `components/chars/` directory
2. AFTER initial save, WHEN any character attribute changes (attributes, skills, equipment, etc.) THEN the changes SHALL be immediately written to the character file
3. IF the character file already exists for a loaded character THEN the system SHALL load existing data and continue real-time updates

### Requirement 3: Start Screen - Character Grid

**User Story:** As a player, I want to see a grid of my saved characters on the start screen, so that I can manage multiple characters.

#### Acceptance Criteria

1. WHEN the start screen loads THEN the top section SHALL display the title "Менеджер персонажей для ролевой игры Fallout (2d20)"
2. BELOW the title, the screen SHALL display a 4-column grid layout
3. AS new characters are saved, new rows SHALL appear automatically to accommodate them
4. CELL 1:1 (first cell) SHALL be the "new character" creation cell with:
   - Dashed border with 5% border radius
   - Large "+" symbol in the center
   - Label "новый персонаж" below the symbol
5. WHEN the "новый персонаж" cell is pressed THEN the Character Screen SHALL load for creating a new character

### Requirement 4: Character List Display

**User Story:** As a player, I want to see my saved characters listed on the start screen, so that I can identify them by name.

#### Acceptance Criteria

1. WHEN a character is saved via "Сохранить персонажа" button THEN a character thumbnail (approximately 100 pixels) SHALL appear on the start screen
2. ABOVE each thumbnail, the character's name SHALL be displayed
3. IF multiple characters exist, they SHALL be arranged in the 4-column grid, filling columns top-to-bottom
4. WHEN a character thumbnail is pressed THEN the Character Screen SHALL load with that character's data

### Requirement 5: Cross-platform Compatibility

**User Story:** As a player, I want the character management system to work on both mobile devices and desktop browsers, so that I can use it anywhere.

#### Acceptance Criteria

1. THE character grid layout SHALL be responsive and adapt to different screen sizes
2. THE file storage mechanism SHALL work on both mobile (React Native) and web (browser) platforms
3. THE UI elements SHALL be touch-friendly for mobile and mouse-friendly for desktop
