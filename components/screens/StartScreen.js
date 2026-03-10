import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { saveCharacter, listCharacters, loadCharacter } from '../CharacterManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_WIDTH = (SCREEN_WIDTH - 48) / 4; // 4 columns with padding

const StartScreen = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const charNames = await listCharacters();
      const charList = [];
      
      for (const name of charNames) {
        const result = await loadCharacter(name);
        if (result.success && result.data) {
          charList.push({
            name: result.data.name || name,
            savedAt: result.data.savedAt,
            origin: result.data.origin,
            thumbnail: generateThumbnail(result.data.origin, result.data.name || name)
          });
        }
      }
      
      setCharacters(charList);
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnail = (origin, name) => {
    // Get the origin image path
    const originImage = origin?.image;
    
    if (originImage) {
      // Use the origin's image as thumbnail
      return originImage;
    }
    
    // Fallback: generate a simple avatar from the first letter of the name
    const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
    const colors = ['#4a90e2', '#50e3c2', '#f5a623', '#bd10e0', '#9013fe', '#e01e37'];
    const color = colors[name ? name.charCodeAt(0) % colors.length : 0];
    
    return {
      uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${color}"/><text x="50" y="50" font-size="48" text-anchor="middle" dy=".3em" fill="white" font-family="Arial">${firstLetter}</text></svg>`
    };
  };

  const handleNewCharacter = () => {
    navigation.navigate('Character', { isNewCharacter: true });
  };

  const handleCharacterPress = (character) => {
    navigation.navigate('Character', { 
      characterName: character.name,
      isNewCharacter: false
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Менеджер персонажей для ролевой игры Fallout (2d20)</Text>
      
      <View style={styles.grid}>
        {/* First cell is always "New Character" */}
        <TouchableOpacity 
          style={styles.newCharacterCell}
          onPress={handleNewCharacter}
          activeOpacity={0.7}
        >
          <Text style={styles.plusSymbol}>+</Text>
          <Text style={styles.newCharacterLabel}>новый персонаж</Text>
        </TouchableOpacity>

        {/* Character cells - fill columns top-to-bottom */}
        {characters.map((character, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.characterCell}
            onPress={() => handleCharacterPress(character)}
            activeOpacity={0.7}
          >
            <Image source={character.thumbnail} style={styles.thumbnail} />
            <Text style={styles.characterName} numberOfLines={1}>
              {character.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f0e68c',
    textAlign: 'center',
    padding: 16,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  newCharacterCell: {
    width: CELL_WIDTH,
    aspectRatio: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#5a5a5a',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    marginBottom: 16,
  },
  plusSymbol: {
    fontSize: 48,
    color: '#f0e68c',
    fontWeight: 'bold',
  },
  newCharacterLabel: {
    fontSize: 12,
    color: '#f0e68c',
    textAlign: 'center',
    marginTop: 8,
  },
  characterCell: {
    width: CELL_WIDTH,
    aspectRatio: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 8,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  characterName: {
    fontSize: 11,
    color: '#f0e68c',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#f0e68c',
    textAlign: 'center',
    marginTop: 100,
  },
});

export default StartScreen;
