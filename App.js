import { Appearance } from 'react-native';

if (Appearance.removeChangeListener === undefined) {
  Appearance.removeChangeListener = () => {};
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { CharacterProvider } from './components/CharacterContext';
import { LocalizationProvider, useLocalization } from './components/LocalizationContext';
import LanguageSwitcher from './components/LanguageSwitcher';

import CharacterScreen from './components/screens/CharacterScreen/CharacterScreen';
import EquipmentScreen from './components/screens/WeaponsAndArmorScreen/WeaponsAndArmorScreen';
import InventoryScreen from './components/screens/InventoryScreen/InventoryScreen';
import PerksAndTraitsScreen from './components/screens/PerksAndTraitsScreen/PerksAndTraitsScreen';

const Tab = createMaterialTopTabNavigator();

function AppNavigator() {
  const { t } = useLocalization();

  return (
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <ImageBackground
          source={require('./assets/bg.png')}
          style={styles.background}
          imageStyle={{ opacity: 0.3 }}>
          <SafeAreaView
            style={styles.container}
            edges={['top', 'bottom']}>
            {/* Language Switcher in top right corner */}
            <View style={styles.languageSwitcherContainer}>
              <LanguageSwitcher />
            </View>

            <Tab.Navigator
              tabBarPosition="bottom"
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color }) => {
                  let iconName;
                  if (route.name === t('navigation.character')) {
                    iconName = focused ? 'person' : 'person-outline';
                  } else if (route.name === t('navigation.equipment')) {
                    iconName = focused ? 'shield' : 'shield-outline';
                  } else if (route.name === t('navigation.inventory')) {
                    iconName = focused
                      ? 'briefcase'
                      : 'briefcase-outline';
                  } else if (route.name === t('navigation.perks')) {
                    iconName = focused ? 'star' : 'star-outline';
                  }
                  return (
                    <Ionicons name={iconName} size={16} color={color} />
                  );
                },
                tabBarStyle: {
                  backgroundColor: '#1a1a1a',
                  borderTopColor: '#5a5a5a',
                },
                tabBarActiveTintColor: '#f0e68c',
                tabBarInactiveTintColor: 'gray',
                tabBarShowIcon: true,
                tabBarIndicatorStyle: {
                  backgroundColor: '#f0e68c',
                  height: 2,
                },
                swipeEnabled: true,
                animationEnabled: true,
                style: { backgroundColor: 'transparent' },
              })}>
              <Tab.Screen
                name={t('navigation.character')}
                component={CharacterScreen}
                options={{
                  tabBarLabel: ({ focused, color }) => (
                    <Text
                      style={{
                        color,
                        fontSize: 11,
                        textAlign: 'center',
                      }}>
                      {t('navigation.character_tab')}
                    </Text>
                  ),
                }}
              />
              <Tab.Screen
                name={t('navigation.equipment')}
                component={EquipmentScreen}
                options={{
                  tabBarLabel: ({ focused, color }) => (
                    <Text
                      style={{
                        color,
                        fontSize: 11,
                        textAlign: 'center',
                      }}>
                      {t('navigation.equipment_tab')}
                    </Text>
                  ),
                }}
              />
              <Tab.Screen
                name={t('navigation.inventory')}
                component={InventoryScreen}
                options={{
                  tabBarLabel: ({ focused, color }) => (
                    <Text
                      style={{
                        color,
                        fontSize: 11,
                        textAlign: 'center',
                      }}>
                      {t('navigation.inventory_tab')}
                    </Text>
                  ),
                }}
              />
              <Tab.Screen
                name={t('navigation.perks')}
                component={PerksAndTraitsScreen}
                options={{
                  tabBarLabel: ({ focused, color }) => (
                    <Text
                      style={{
                        color,
                        fontSize: 11,
                        textAlign: 'center',
                      }}>
                      {t('navigation.perks_tab')}
                    </Text>
                  ),
                }}
              />
            </Tab.Navigator>
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
