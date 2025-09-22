// weaponNameUtils.js
// Утилиты для преобразования ID оружия и модификаций в человекочитаемые названия

import weaponsData from '../../../../assets/Equipment/weapons.json';
import weaponModsData from '../../../../assets/Equipment/weapon_mods.json';
import ammoData from '../../../../assets/Equipment/ammo.json';

/**
 * Преобразует идентификатор оружия с модификациями в человекочитаемое название
 * @param {string} weaponIdWithMods - Идентификатор в формате weapon_029_mod23_mod32_mod01_mod09 или weapon_029_mod_023_mod_032_mod_001_mod_009
 * @returns {string} - Название в формате "Prefix1 Prefix2 ... WeaponName" или просто "WeaponName" если нет модификаций
 */
export const convertWeaponIdToDisplayName = (weaponIdWithMods) => {
  if (!weaponIdWithMods) return 'Неизвестный предмет';
  
  // Если это ID патрона, возвращаем его название
  if (weaponIdWithMods.startsWith('ammo_')) {
    const ammo = ammoData.find(a => a.id === weaponIdWithMods);
    return ammo ? ammo.name : weaponIdWithMods;
  }
  
  // Разбиваем строку на компоненты
  const parts = weaponIdWithMods.split('_');
  
  // Первые две части составляют ID оружия
  const weaponId = parts.length >= 2 ? `${parts[0]}_${parts[1]}` : parts[0];
  
  // Остальные части - это слоты для модов
  // Обрабатываем оба формата: mod23 и mod_023
  const modIds = [];
  for (let i = 2; i < parts.length; i++) {
    // Пропускаем пустые значения и "0"/"00"
    if (!parts[i] || parts[i] === '0' || parts[i] === '00') continue;
    
    // Если текущая часть "mod" и следующая существует, объединяем их
    if (parts[i] === 'mod' && i + 1 < parts.length && parts[i + 1] && parts[i + 1] !== '0' && parts[i + 1] !== '00') {
      modIds.push(`mod_${parts[i + 1]}`);
      i++; // Пропускаем следующую часть
    } else {
      // Если это не "mod", добавляем как есть
      modIds.push(parts[i]);
    }
  }
  
  // Находим базовое оружие
  const weapon = weaponsData.find(w => w.id === weaponId);
  if (!weapon) return weaponIdWithMods; // Если не найдено, возвращаем исходную строку
  
  // Получаем префиксы модификаций (только если Prefix существует)
  const prefixes = modIds.map(modId => {
    // Пропускаем пустые идентификаторы и "00"
    if (!modId || modId === '00' || modId === '0') return null;
    
    // Убираем префиксы "mod_" если они есть
    const cleanModId = modId.startsWith('mod_') ? modId.substring(4) : modId;
    const fullModId = `mod_${cleanModId}`;
    
    const mod = weaponModsData.find(m => m.id === fullModId);
    return mod && mod.Prefix ? mod.Prefix : null;
  }).filter(prefix => prefix !== null); // Убираем null значения
  
  // Формируем название: Prefix1 Prefix2 ... WeaponName
  if (prefixes.length > 0) {
    return `${prefixes.join(' ')} ${weapon.Name}`;
  }
  
  // Если модификаций нет, возвращаем только название оружия
  return weapon.Name;
};

/**
 * Получает базовое оружие по идентификатору
 * @param {string} weaponId - Идентификатор оружия
 * @returns {object|null} - Объект оружия или null
 */
export const getBaseWeaponById = (weaponId) => {
  if (!weaponId) return null;
  
  // Извлекаем базовый ID из строки с модификациями
  const parts = weaponId.split('_');
  const baseId = parts.length >= 2 ? `${parts[0]}_${parts[1]}` : parts[0];
  return weaponsData.find(w => w.id === baseId) || null;
};

/**
 * Получает модификации по идентификаторам
 * @param {string[]} modIds - Массив идентификаторов модификаций
 * @returns {object[]} - Массив объектов модификаций
 */
export const getModificationsByIds = (modIds) => {
  if (!modIds || !Array.isArray(modIds)) return [];
  
  return modIds
    .filter(modId => modId !== '00' && modId !== '0' && modId) // Исключаем пустые идентификаторы
    .map(modId => {
      // Убираем префиксы "mod_" если они есть
      const cleanModId = modId.startsWith('mod_') ? modId.substring(4) : modId;
      const fullModId = `mod_${cleanModId}`;
      return weaponModsData.find(m => m.id === fullModId);
    })
    .filter(mod => mod !== undefined); // Исключаем не найденные модификации
};

/**
 * Получает название патрона по идентификатору
 * @param {string} ammoId - Идентификатор патрона
 * @returns {string} - Название патрона
 */
export const getAmmoNameById = (ammoId) => {
  if (!ammoId) return 'Неизвестные патроны';
  
  const ammo = ammoData.find(a => a.id === ammoId);
  return ammo ? ammo.name : ammoId;
};