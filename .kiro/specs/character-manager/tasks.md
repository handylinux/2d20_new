# Implementation Plan

- [x] 1. Create character manager utility for file storage



 - Create `components/CharacterManager.js` with save/load/list/delete functions
 - Implement filename sanitization for safe file naming
 - Implement platform-specific storage (React Native FileSystem for mobile, localStorage for web)
 - _Requirements: 1.5, 2.1, 2.2, 3.4_

- [x] 2. Create Start Screen with character grid





 - Create `components/screens/StartScreen.js` component
 - Implement 4-column grid layout with responsive design
 - Create "New Character" cell (dashed border, + symbol, label)
 - Implement character list display with thumbnails and names
 - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2_

- [x] 3. Modify Character Screen - add name input and save button



 - Add name input field at top of character creation section
 - Implement save button at bottom (disabled until name entered)
 - Add logic to disable all other fields until save button pressed
 - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4. Implement real-time file saving after initial save



 - After "Сохранить персонажа" button pressed, create character file
 - Set up real-time updates to file on any attribute change
 - Implement file path configuration for both platforms
 - _Requirements: 1.5, 2.1, 2.2_

- [x] 5. Wire up navigation between screens




 - Add navigation from Start Screen to Character Screen for new character
 - Add navigation from Start Screen to Character Screen for existing character (load data)
 - Implement character data loading from file to CharacterContext
 - _Requirements: 3.5, 4.5_

- [ ] 6. Create character thumbnail generation
 - Generate simple avatar/thumbnail for each character
 - Store thumbnail in character file or generate from name
 - Display thumbnail on Start Screen character cells
 - _Requirements: 4.1_

- [x] 7. Test and verify cross-platform compatibility





 - Test on React Native (mobile)
 - Test on web browser
 - Verify file storage works on both platforms
 - _Requirements: 5.1, 5.2_
