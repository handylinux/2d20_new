// Утилиты для работы с модификациями оружия (новая система на основе референса)

import weaponMods from '../../../../assets/Equipment/weapon_mods.json';

// Функция для получения данных модификации по ID
export const getModificationDataById = (modId) => {
  return weaponMods.find(mod => mod.id === modId) || null;
};

// Функция для получения всех модификаций для определенного слота
export const getModificationsBySlot = (slot) => {
  return weaponMods.filter(mod => mod.Slot === slot);
};

// Функция для получения доступных модификаций для оружия
export const getAvailableModificationsForWeapon = (weaponId) => {
  return weaponMods.filter(mod => 
    mod.applies_to_ids && mod.applies_to_ids.includes(weaponId)
  );
};

// Функция для группировки модификаций по слотам
export const groupModificationsBySlot = (modifications) => {
  const grouped = {};
  modifications.forEach(mod => {
    if (!grouped[mod.Slot]) {
      grouped[mod.Slot] = [];
    }
    grouped[mod.Slot].push(mod);
  });
  return grouped;
};

// Функция для применения эффектов модификации к оружию
export const applyModificationEffects = (weapon, modification) => {
  const modifiedWeapon = { ...weapon };
  
  if (!modification.Effects) return modifiedWeapon;
  
  const effects = modification.Effects.split(', ');
  
  effects.forEach(effect => {
    const trimmedEffect = effect.trim();
    
    // Обработка изменения урона
    if (trimmedEffect.includes('plus') && trimmedEffect.includes('CD Damage')) {
      const match = trimmedEffect.match(/plus (\d+) CD Damage/);
      if (match) {
        const damageIncrease = parseInt(match[1]);
        modifiedWeapon['Damage Rating'] = (modifiedWeapon['Damage Rating'] || 0) + damageIncrease;
      }
    } else if (trimmedEffect.includes('minus') && trimmedEffect.includes('CD Damage')) {
      const match = trimmedEffect.match(/minus (\d+) CD Damage/);
      if (match) {
        const damageDecrease = parseInt(match[1]);
        modifiedWeapon['Damage Rating'] = Math.max(0, (modifiedWeapon['Damage Rating'] || 0) - damageDecrease);
      }
    } else if (trimmedEffect.includes('Set') && trimmedEffect.includes('CD Damage')) {
      const match = trimmedEffect.match(/Set (\d+) CD Damage/);
      if (match) {
        const newDamage = parseInt(match[1]);
        modifiedWeapon['Damage Rating'] = newDamage;
      }
    }
    
    // Обработка изменения скорострельности
    else if (trimmedEffect.includes('plus') && trimmedEffect.includes('Fire Rate')) {
      const match = trimmedEffect.match(/plus (\d+) Fire Rate/);
      if (match) {
        const fireRateIncrease = parseInt(match[1]);
        modifiedWeapon['Rate of Fire'] = (modifiedWeapon['Rate of Fire'] || 0) + fireRateIncrease;
      }
    } else if (trimmedEffect.includes('minus') && trimmedEffect.includes('Fire Rate')) {
      const match = trimmedEffect.match(/minus (\d+) Fire Rate/);
      if (match) {
        const fireRateDecrease = parseInt(match[1]);
        modifiedWeapon['Rate of Fire'] = Math.max(0, (modifiedWeapon['Rate of Fire'] || 0) - fireRateDecrease);
      }
    }
    
    // Обработка изменения дальности
    else if (trimmedEffect.includes('plus') && trimmedEffect.includes('Range')) {
      const match = trimmedEffect.match(/plus (\d+) Range/);
      if (match) {
        const rangeIncrease = parseInt(match[1]);
        const rangeLevels = ['C', 'M', 'L'];
        const currentIndex = rangeLevels.indexOf(modifiedWeapon.Range);
        if (currentIndex !== -1) {
          const newIndex = Math.min(currentIndex + rangeIncrease, rangeLevels.length - 1);
          modifiedWeapon.Range = rangeLevels[newIndex];
        }
      }
    } else if (trimmedEffect.includes('minus') && trimmedEffect.includes('Range')) {
      const match = trimmedEffect.match(/minus (\d+) Range/);
      if (match) {
        const rangeDecrease = parseInt(match[1]);
        const rangeLevels = ['C', 'M', 'L'];
        const currentIndex = rangeLevels.indexOf(modifiedWeapon.Range);
        if (currentIndex !== -1) {
          const newIndex = Math.max(currentIndex - rangeDecrease, 0);
          modifiedWeapon.Range = rangeLevels[newIndex];
        }
      }
    }
    
    // Обработка добавления качеств
    else if (trimmedEffect.startsWith('gain ')) {
      const quality = trimmedEffect.replace('gain ', '');
      const currentQualities = modifiedWeapon.Qualities ? modifiedWeapon.Qualities.split(', ') : [];
      
      // Специальная обработка для некоторых качеств
      if (quality === 'Vicious') {
        // Добавляем к эффектам урона
        if (modifiedWeapon['Damage Effects']) {
          if (!modifiedWeapon['Damage Effects'].includes('Vicious')) {
            modifiedWeapon['Damage Effects'] += ', Vicious';
          }
        } else {
          modifiedWeapon['Damage Effects'] = 'Vicious';
        }
      } else if (quality === 'Burst') {
        // Добавляем к эффектам урона
        if (modifiedWeapon['Damage Effects']) {
          if (!modifiedWeapon['Damage Effects'].includes('Burst')) {
            modifiedWeapon['Damage Effects'] += ', Burst';
          }
        } else {
          modifiedWeapon['Damage Effects'] = 'Burst';
        }
      } else if (quality.startsWith('Piercing')) {
        // Добавляем к эффектам урона
        if (modifiedWeapon['Damage Effects']) {
          if (!modifiedWeapon['Damage Effects'].includes('Piercing')) {
            modifiedWeapon['Damage Effects'] += ', ' + quality;
          }
        } else {
          modifiedWeapon['Damage Effects'] = quality;
        }
      } else if (quality === 'Supressed') {
        // Добавляем качество "Тихое"
        if (!currentQualities.includes('Suppressed')) {
          currentQualities.push('Suppressed');
          modifiedWeapon.Qualities = currentQualities.join(', ');
        }
      } else {
        // Обычные качества
        if (!currentQualities.includes(quality)) {
          currentQualities.push(quality);
          modifiedWeapon.Qualities = currentQualities.join(', ');
        }
      }
    }
    
    // Обработка удаления качеств
    else if (trimmedEffect.startsWith('lose ')) {
      const quality = trimmedEffect.replace('lose ', '');
      const currentQualities = modifiedWeapon.Qualities ? modifiedWeapon.Qualities.split(', ') : [];
      
      if (quality === 'Two-Handed') {
        // Удаляем качество "Двуручное"
        const filteredQualities = currentQualities.filter(q => q !== 'Two-Handed');
        modifiedWeapon.Qualities = filteredQualities.length > 0 ? filteredQualities.join(', ') : '';
      } else if (quality === 'Close Quarters') {
        // Удаляем качество "Вплотную"
        const filteredQualities = currentQualities.filter(q => q !== 'Close Quarters');
        modifiedWeapon.Qualities = filteredQualities.length > 0 ? filteredQualities.join(', ') : '';
      } else if (quality === 'Inaccurate') {
        // Удаляем качество "Неточный"
        const filteredQualities = currentQualities.filter(q => q !== 'Inaccurate');
        modifiedWeapon.Qualities = filteredQualities.length > 0 ? filteredQualities.join(', ') : '';
      }
    }
    
    // Обработка изменения патронов
    else if (trimmedEffect.includes('Ammo')) {
      const match = trimmedEffect.match(/Ammo (.+)/);
      if (match) {
        modifiedWeapon.Ammo = match[1];
      }
    }
  });
  
  // Применяем изменения веса
  if (modification.Weight !== null && modification.Weight !== undefined) {
    const currentWeight = parseInt(modifiedWeapon.Weight) || 0;
    const newWeight = currentWeight + (modification.Weight || 0);
    modifiedWeapon.Weight = Math.max(0, newWeight).toString();
  }
  
  // Применяем изменения цены
  if (modification.Cost !== null && modification.Cost !== undefined) {
    modifiedWeapon.Cost = (modifiedWeapon.Cost || 0) + modification.Cost;
  }
  
  return modifiedWeapon;
};

// Функция для создания названия модифицированного оружия
export const createModifiedWeaponName = (baseWeapon, appliedMods) => {
  // Проверяем, что у нас есть базовое оружие и его название
  const baseName = (baseWeapon.trueOriginalName || baseWeapon.originalName || baseWeapon.Name || baseWeapon.Название || baseWeapon.name) || 'Неизвестное оружие';
  
  // Защита от некорректных значений
  if (!baseName || baseName === 'Неизвестное оружие') {
    // Если базовое имя не определено, используем только префиксы
    const prefixes = appliedMods
      .map(mod => mod.Prefix)
      .filter(prefix => prefix && prefix.trim() !== '')
      .join(' ');
    
    if (prefixes) {
      return `${prefixes} ${baseName}`;
    }
    return baseName;
  }
  
  if (!appliedMods || appliedMods.length === 0) {
    return baseName;
  }
  
  // Собираем префиксы от всех модификаций
  const prefixes = appliedMods
    .map(mod => mod.Prefix)
    .filter(prefix => prefix && prefix.trim() !== '')
    .join(' ');
  
  if (prefixes) {
    return `${prefixes} ${baseName}`;
  }
  
  return baseName;
};

// Функция для применения нескольких модификаций к оружия
export const applyMultipleModifications = (baseWeapon, modificationIds) => {
  let modifiedWeapon = { ...baseWeapon };
  const appliedMods = [];
  
  // Сохраняем оригинальные свойства
  modifiedWeapon.originalDamage = baseWeapon['Damage Rating'] || baseWeapon.Урон;
  modifiedWeapon.originalFireRate = baseWeapon['Rate of Fire'] || baseWeapon['Скорость стрельбы'];
  modifiedWeapon.originalRange = baseWeapon.Range || baseWeapon.Дальность;
  modifiedWeapon.originalQualities = baseWeapon.Qualities || baseWeapon.Качества;
  modifiedWeapon.originalEffects = baseWeapon['Damage Effects'] || baseWeapon.Эффекты;
  modifiedWeapon.originalWeight = baseWeapon.Weight || baseWeapon.Вес;
  modifiedWeapon.originalCost = baseWeapon.Cost || baseWeapon.Цена;

  // Применяем каждую модификацию
  modificationIds.forEach(modId => {
    const modification = getModificationDataById(modId);
    if (modification) {
      modifiedWeapon = applyModificationEffects(modifiedWeapon, modification);
      appliedMods.push(modification);
    }
  });

  // Сохраняем ID примененных модификаций
  modifiedWeapon.appliedModIds = [...modificationIds];
  
  // Удаляем все поля для названий
  delete modifiedWeapon.Name;
  delete modifiedWeapon.name;
  delete modifiedWeapon.displayName;
  delete modifiedWeapon.trueOriginalName;
  delete modifiedWeapon.originalName;
  
  // Возвращаем модифицированное оружие без полей названий
  return modifiedWeapon;
};

// Функция для получения конфликтующих модификаций (одного слота)
export const getConflictingModifications = (modificationId, appliedModIds) => {
  const modification = getModificationDataById(modificationId);
  if (!modification) return [];
  
  return appliedModIds.filter(appliedModId => {
    const appliedMod = getModificationDataById(appliedModId);
    return appliedMod && appliedMod.Slot === modification.Slot && appliedMod.id !== modification.id;
  });
};

// Функция для проверки совместимости модификации с оружием
export const isModificationCompatible = (weaponId, modificationId) => {
  const modification = getModificationDataById(modificationId);
  return modification && modification.applies_to_ids && modification.applies_to_ids.includes(weaponId);
};

// Функция для получения базового оружия (без модификаций)
export const getBaseWeapon = (weapon) => {
  const baseWeapon = { ...weapon };
  
  // Удаляем данные о модификациях
  delete baseWeapon.appliedModIds;
  delete baseWeapon.originalDamage;
  delete baseWeapon.originalFireRate;
  delete baseWeapon.originalRange;
  delete baseWeapon.originalQualities;
  delete baseWeapon.originalEffects;
  delete baseWeapon.originalWeight;
  delete baseWeapon.originalCost;
  
  // Возвращаем оригинальное название если есть
  if (weapon.originalName) {
    baseWeapon.Name = weapon.originalName;
  } else if (weapon.originalName === '') {
    // Если оригинальное название пустое, используем базовое
    baseWeapon.Name = weapon.Name || weapon.Название;
  }
  
  return baseWeapon;
};

// Функция для генерации уникального ID для экземпляра оружия
export const generateWeaponInstanceId = (baseWeaponId, modificationIds = []) => {
  // Определяем порядок слотов для ID
  const slotOrder = [
    'Receivers', 'Capacitors', 'Barrels', 'Magazines', 
    'Grips', 'Stocks', 'Sights', 'Muzzles', 'Fuels', 
    'Dishes', 'Tanks', 'Nozzles', 'Uniques'
  ];

  // Создаем карту модификаций по слотам
  const modsBySlot = {};
  modificationIds.forEach(modId => {
    const mod = getModificationDataById(modId);
    if (mod && mod.Slot) {
      modsBySlot[mod.Slot] = mod.id;
    }
  });

  // Формируем части ID
  const idParts = [baseWeaponId];
  
  slotOrder.forEach(slot => {
    if (modsBySlot[slot]) {
      idParts.push(modsBySlot[slot]);
    } else {
      idParts.push('0');
    }
  });

  return idParts.join('_');
};

// Функция для парсинга ID экземпляра оружия
export const parseWeaponInstanceId = (instanceId) => {
  const parts = instanceId.split('_');
  const baseWeaponId = parts[0];
  const modificationIds = parts.slice(1).filter(id => id !== '0');
  
  return {
    baseWeaponId,
    modificationIds
  };
};

// Функция для получения базового ID оружия
export const getBaseWeaponId = (weapon) => {
  return weapon.weaponId || weapon.id || weapon.code;
};

// Функция для проверки, является ли оружие модифицированным
export const isWeaponModified = (weapon) => {
  return weapon && weapon.appliedModIds && weapon.appliedModIds.length > 0;
};

// Функция для получения списка примененных модификаций
export const getAppliedModifications = (weapon) => {
  if (!isWeaponModified(weapon)) return [];
  
  return weapon.appliedModIds
    .map(modId => getModificationDataById(modId))
    .filter(mod => mod !== null);
};

// Функция для расчета общей стоимости модификаций
export const calculateTotalModificationCost = (modificationIds) => {
  return modificationIds.reduce((total, modId) => {
    const mod = getModificationDataById(modId);
    return total + (mod?.Cost || 0);
  }, 0);
};

// Функция для расчета общего изменения веса от модификаций
export const calculateTotalWeightChange = (modificationIds) => {
  return modificationIds.reduce((total, modId) => {
    const mod = getModificationDataById(modId);
    return total + (mod?.Weight || 0);
  }, 0);
};

// Функция для проверки требований к перкам для модификаций
export const checkModificationPerkRequirements = (modificationIds, characterPerks) => {
  const unmetRequirements = [];
  
  modificationIds.forEach(modId => {
    const mod = getModificationDataById(modId);
    if (mod && mod['Perk 1'] && !characterPerks.includes(mod['Perk 1'])) {
      unmetRequirements.push({
        modification: mod.Name,
        requiredPerk: mod['Perk 1']
      });
    }
  });
  
  return unmetRequirements;
};

// Функция для получения описания изменений от модификаций
export const getModificationEffectsDescription = (modificationIds) => {
  const effects = [];
  
  modificationIds.forEach(modId => {
    const mod = getModificationDataById(modId);
    if (mod && mod.EffectDescription) {
      effects.push(`${mod.Name}: ${mod.EffectDescription}`);
    }
  });
  
  return effects;
};

// Функция для создания читаемого имени экземпляра оружия
export const getWeaponInstanceDisplayName = (instanceId) => {
  const { baseWeaponId, modificationIds } = parseWeaponInstanceId(instanceId);
  
  if (modificationIds.length === 0) {
    return `Базовая версия (${baseWeaponId})`;
  }
  
  const modNames = modificationIds
    .map(modId => {
      const mod = getModificationDataById(modId);
      return mod ? mod.Name : 'Неизвестная модификация';
    })
    .join(', ');
  
  return `${baseWeaponId} с модификациями: ${modNames}`;
};

// Функция для восстановления оружия из ID экземпляра (требует доступа к базе оружия)
export const reconstructWeaponFromInstanceId = (instanceId, weaponsDatabase) => {
  const { baseWeaponId, modificationIds } = parseWeaponInstanceId(instanceId);
  
  // Находим базовое оружие в базе данных
  const baseWeapon = weaponsDatabase.find(w => 
    w.id === baseWeaponId || w.weaponId === baseWeaponId || w.code === baseWeaponId
  );
  
  if (!baseWeapon) {
    throw new Error(`Базовое оружие с ID ${baseWeaponId} не найдено`);
  }
  
  // Применяем модификации
  return applyMultipleModifications(baseWeapon, modificationIds);
};

// Функция для вычисления модифицированного оружия (для использования в WeaponsAndArmorScreen)
export const computeModifiedWeapon = (baseWeapon, modificationIds) => {
  const result = applyMultipleModifications(baseWeapon, modificationIds);
  // Удаляем все поля для названий
  delete result.displayName;
  delete result.Name;
  delete result.name;
  delete result.trueOriginalName;
  delete result.originalName;
  return result;
};

// Функция для генерации названия оружия по ID и модификациям
export const generateWeaponDisplayName = (weaponId, modificationIds = []) => {
  // Сначала находим базовое оружие в данных
  // Здесь мы просто используем weaponId как часть названия
  // В реальном приложении нужно загрузить данные оружия из weapons.json
  
  // Для простоты используем только ID оружия как базовое название
  // В реальном приложении здесь должна быть логика поиска в базе данных
  
  // Если нет модификаций - возвращаем только ID оружия
  if (!modificationIds || modificationIds.length === 0) {
    return weaponId;
  }
  
  // Формируем полный ID с модификациями
  const fullId = `${weaponId}_${modificationIds.join('_')}`;
  
  // В реальном приложении здесь должна быть логика получения настоящего названия
  // Для временного решения возвращаем ID как название
  return fullId;
};