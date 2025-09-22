import React, { createContext, useContext, useState, useEffect } from 'react';
import ruTranslations from '../locales/ru.json';
import enTranslations from '../locales/en.json';

const LocalizationContext = createContext();

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

const LANGUAGES = {
  ru: 'ru',
  en: 'en',
};

const DEFAULT_LANGUAGE = LANGUAGES.ru;

export const LocalizationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState({});

  // Загрузка переводов при смене языка
  useEffect(() => {
    if (currentLanguage === 'ru') {
      setTranslations(ruTranslations);
    } else if (currentLanguage === 'en') {
      setTranslations(enTranslations);
    } else {
      setTranslations(ruTranslations); // Fallback to Russian
    }
  }, [currentLanguage]);

  // Смена языка
  const changeLanguage = (language) => {
    setCurrentLanguage(language);
  };

  // Функция перевода с поддержкой параметров
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations;

    // Навигация по дереву переводов
    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key '${key}' not found for language '${currentLanguage}'`);
      return key;
    }

    // Подстановка параметров в стиле {paramName}
    return value.replace(/{(\w+)}/g, (match, paramName) => {
      return params[paramName] !== undefined ? params[paramName] : match;
    });
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isRTL: false, // Добавляем поддержку RTL если понадобится
    languages: LANGUAGES,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export default LocalizationContext;