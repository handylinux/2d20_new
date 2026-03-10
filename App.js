import { Appearance } from 'react-native';

if (Appearance.removeChangeListener === undefined) {
  Appearance.removeChangeListener = () => {};
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { CharacterProvider } from './components/CharacterContext';
import { LocalizationProvider, useLocalization } from './components/LocalizationContext';
import LanguageSwitcher from './components/LanguageSwitcher';

import StartScreen from './components/screens/StartScreen';
import CharacterScreen from './components/screens/CharacterScreen/CharacterScreen';
import EquipmentScreen from './components/screens/WeaponsAndArmorScreen/WeaponsAndArmorScreen';
import InventoryScreen from './components/screens/InventoryScreen/InventoryScreen';
import PerksAndTraitsScreen from './components/screens/PerksAndTraitsScreen/PerksAndTraitsScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { t } = useLocalization();

  return (
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <ImageBackground
          source={require('./assets/bg.png')}
          style={styles.background}
          imageStyle={{ opacity: 0.3 }}>
          <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Language Switcher in top right corner */}
            <View style={styles.languageSwitcherContainer}>
              <LanguageSwitcher />
            </View>

            <Stack.Navigator initialRouteName="Start">
              <Stack.Screen
                name="Start"
                component={StartScreen}
                options={{
                  headerTitle: t('navigation.start'),
                  headerStyle: {
                    backgroundColor: '#1a1a1a',
                  },
                  headerTintColor: '#f0e68c',
                }}
              />
              <Stack.Screen
                name="Character"
                component={CharacterScreen}
                options={{
                  headerTitle: t('navigation.character'),
                  headerStyle: {
                    backgroundColor: '#1a1a1a',
                  },
                  headerTintColor: '#f0e68c',
                }}
              />
              <Stack.Screen
                name="Equipment"
                component={EquipmentScreen}
                options={{
                  headerTitle: t('navigation.equipment'),
                  headerStyle: {
                    backgroundColor: '#1a1a1a',
                  },
                  headerTintColor: '#f0e68c',
                }}
              />
              <Stack.Screen
                name="Inventory"
                component={InventoryScreen}
                options={{
                  headerTitle: t('navigation.inventory'),
                  headerStyle: {
                    backgroundColor: '#1a1a1a',
                  },
                  headerTintColor: '#f0e68c',
                }}
              />
              <Stack.Screen
                name="Perks"
                component={PerksAndTraitsScreen}
                options={{
                  headerTitle: t('navigation.perks'),
                  headerStyle: {
                    backgroundColor: '#1a1a1a',
                  },
                  headerTintColor: '#f0e68c',
                }}
              />
            </Stack.Navigator>
          </SafeAreaView>
        </ImageBackground>
      </View>
    </NavigationContainer>
  );
}

function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <LocalizationProvider>
          <CharacterProvider>
            <AppNavigator />
          </CharacterProvider>
        </LocalizationProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  languageSwitcherContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
  },
});

export default App;
