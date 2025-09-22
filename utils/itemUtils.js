// Утилиты для работы с предметами без адаптеров

/**
 * Получает уникальный идентификатор предмета
 * @param {Object} item - Предмет
 * @returns {string} Уникальный идентификатор
 */
export function getItemId(item) {
  if (!item) return null;
  
  // Для оружия используем weaponId или id
  if (item.itemType === 'weapon' || item.weaponId || item.id?.startsWith('weapon_')) {
    return item.weaponId || item.id;
  }
  
  // Для других предметов используем название как fallback
  return item.Name || item.Название || item.name;
}

/**
 * Получает отображаемое название предмета
 * @param {Object} item - Предмет
 * @returns {string} Название для отображения
 */
export function getItemDisplayName(item) {
  if (!item) return 'Неизвестный предмет';
  
  return item.Name || item.Название || item.name || 'Неизвестный предмет';
}

/**
 * Сравнивает два предмета по их идентификаторам
 * @param {Object} item1 - Первый предмет
 * @param {Object} item2 - Второй предмет
 * @returns {boolean} true если предметы одинаковые
 */
export function isSameItem(item1, item2) {
  if (!item1 || !item2) return false;
  
  // Сначала проверяем uniqueId для модифицированных предметов
  if (item1.uniqueId && item2.uniqueId) {
    return item1.uniqueId === item2.uniqueId;
  }
  
  // Затем сравниваем по основному ID
  const id1 = getItemId(item1);
  const id2 = getItemId(item2);
  
  return id1 === id2;
}

/**
 * Получает данные оружия по ID из базы
 * @param {string} weaponId - ID оружия
 * @param {Array} weaponsDatabase - База данных оружия
 * @returns {Object|null} Данные оружия или null
 */
export function getWeaponById(weaponId, weaponsDatabase) {
  if (!weaponId || !weaponsDatabase) return null;
  
  return weaponsDatabase.find(weapon => weapon.id === weaponId) || null;
}