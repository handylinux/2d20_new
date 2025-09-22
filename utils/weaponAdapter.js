// Адаптер для совместимости старой и новой системы оружия

// Функция для получения названия оружия (совместимость)
export const getWeaponName = (weapon) => {
  return weapon.Name || weapon.Название || weapon.name || 'Неизвестное оружие';
};

// Функция для получения урона оружия (совместимость)
export const getWeaponDamage = (weapon) => {
  return weapon['Damage Rating'] || weapon.Урон || weapon.damage || 0;
};

// Функция для получения скорострельности оружия (совместимость)
export const getWeaponFireRate = (weapon) => {
  return weapon['Rate of Fire'] || weapon['Скорость стрельбы'] || weapon.fireRate || 0;
};

// Функция для получения дальности оружия (совместимость)
export const getWeaponRange = (weapon) => {
  return weapon.Range || weapon.Дальность || weapon.range || 'C';
};

// Функция для получения веса оружия (совместимость)
export const getWeaponWeight = (weapon) => {
  const weight = weapon.Weight || weapon.Вес || weapon.weight || 0;
  return typeof weight === 'string' ? parseInt(weight) || 0 : weight;
};

// Функция для получения цены оружия (совместимость)
export const getWeaponCost = (weapon) => {
  return weapon.Cost || weapon.Цена || weapon.cost || 0;
};

// Функция для получения эффектов урона (совместимость)
export const getWeaponDamageEffects = (weapon) => {
  return weapon['Damage Effects'] || weapon.Эффекты || weapon.effects || '';
};

// Функция для получения качеств оружия (совместимость)
export const getWeaponQualities = (weapon) => {
  return weapon.Qualities || weapon.Качества || weapon.qualities || '';
};

// Функция для получения типа урона (совместимость)
export const getWeaponDamageType = (weapon) => {
  return weapon['Damage Type'] || weapon['Тип урона'] || weapon.damageType || 'Physical';
};

// Функция для получения типа оружия (совместимость)
export const getWeaponType = (weapon) => {
  return weapon['Weapon Type'] || weapon['Тип оружия'] || weapon.weaponType || 'Small Guns';
};

// Функция для получения патронов (совместимость)
export const getWeaponAmmo = (weapon) => {
  return weapon.Ammo || weapon.Патроны || weapon.ammo || '';
};

// Функция для получения редкости (совместимость)
export const getWeaponRarity = (weapon) => {
  return weapon.Rarity || weapon.Редкость || weapon.rarity || 0;
};

// Функция для получения описания (совместимость)
export const getWeaponFlavour = (weapon) => {
  return weapon.Flavour || weapon.Описание || weapon.description || '';
};

// Функция для конвертации старого формата в новый
export const convertWeaponToNewFormat = (weapon) => {
  if (!weapon) return null;

  // Если уже в новом формате, возвращаем как есть
  if (weapon.Name && weapon['Damage Rating'] !== undefined) {
    return weapon;
  }

  // Конвертируем из старого формата
  return {
    ...weapon,
    Name: getWeaponName(weapon),
    'Damage Rating': getWeaponDamage(weapon),
    'Rate of Fire': getWeaponFireRate(weapon),
    Range: getWeaponRange(weapon),
    Weight: getWeaponWeight(weapon).toString(),
    Cost: getWeaponCost(weapon),
    'Damage Effects': getWeaponDamageEffects(weapon),
    Qualities: getWeaponQualities(weapon),
    'Damage Type': getWeaponDamageType(weapon),
    'Weapon Type': getWeaponType(weapon),
    Ammo: getWeaponAmmo(weapon),
    Rarity: getWeaponRarity(weapon),
    Flavour: getWeaponFlavour(weapon),
    itemType: weapon.itemType || 'weapon',
    appliedModIds: weapon.appliedModIds || []
  };
};

// Функция для конвертации нового формата в старый (для обратной совместимости)
export const convertWeaponToOldFormat = (weapon) => {
  if (!weapon) return null;

  // Если уже в старом формате, возвращаем как есть
  if (weapon.Название && weapon.Урон !== undefined) {
    return weapon;
  }

  // Конвертируем из нового формата
  return {
    ...weapon,
    Название: getWeaponName(weapon),
    Урон: getWeaponDamage(weapon),
    'Скорость стрельбы': getWeaponFireRate(weapon),
    Дальность: getWeaponRange(weapon),
    Вес: getWeaponWeight(weapon),
    Цена: getWeaponCost(weapon),
    Эффекты: getWeaponDamageEffects(weapon),
    Качества: getWeaponQualities(weapon),
    'Тип урона': getWeaponDamageType(weapon),
    'Тип оружия': getWeaponType(weapon),
    Патроны: getWeaponAmmo(weapon),
    Редкость: getWeaponRarity(weapon),
    Описание: getWeaponFlavour(weapon),
    itemType: weapon.itemType || 'weapon',
    appliedModIds: weapon.appliedModIds || []
  };
};