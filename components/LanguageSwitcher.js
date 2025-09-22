import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useLocalization } from './LocalizationContext';
import { Ionicons } from '@expo/vector-icons';

const LanguageSwitcher = ({ style }) => {
  const { currentLanguage, changeLanguage, t } = useLocalization();

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'ru' ? 'en' : 'ru';
    changeLanguage(newLanguage);
  };

  const getCurrentLanguageName = () => {
    return currentLanguage === 'ru' ? t('common.russian') : t('common.english');
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={toggleLanguage}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        <Ionicons
          name="language"
          size={16}
          color="#f0e68c"
          style={styles.icon}
        />
        <Text style={styles.text}>{getCurrentLanguageName()}</Text>
        <Ionicons
          name="chevron-down"
          size={12}
          color="#f0e68c"
          style={styles.arrow}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(240, 230, 140, 0.3)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    color: '#f0e68c',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  arrow: {
    opacity: 0.8,
  },
});

export default LanguageSwitcher;