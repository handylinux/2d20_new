import React, { createContext, useState, useContext } from 'react';
import {
  createInitialAttributes,
  ALL_SKILLS,
  getLuckPoints,
  calculateMaxHealth,
  calculateInitiative,
  calculateDefense,
  calculateMeleeBonus,
  calculateCarryWeight
} from './screens/CharacterScreen/logic/characterLogic';
import { meetsPerkRequirements, getPerkUnmetReasons, annotatePerks } from './screens/CharacterScreen/logic/perksLogic';

// --- ВАЖНО: поправьте путь к utils если у вас он отличается ---
import {
  generateWeaponInstanceId,
  parseWeaponInstanceId,
  reconstructWeaponFromInstanceId
} from './screens/InventoryScreen/modals/weaponModificationUtils';

const CharacterContext = createContext();

export const CharacterProvider = ({ children }) => {
  const [level, setLevel] = useState(1);
  const [attributes, setAttributes] = useState(createInitialAttributes());
  const [skills, setSkills] = useState(ALL_SKILLS.map(s => ({...s, value: 0})));
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [extraTaggedSkills, setExtraTaggedSkills] = useState([]);
  const [forcedSelectedSkills, setForcedSelectedSkills] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [trait, setTrait] = useState(null);
  const [equipment, setEquipment] = useState({ items: [] }); // { items: [...] }
  const [effects, setEffects] = useState([]);
  const [equippedWeapons, setEquippedWeapons] = useState([null, null]);
  const [equippedArmor, setEquippedArmor] = useState({
    head: { armor: null, clothing: null },
    body: { armor: null, clothing: null },
    leftArm: { armor: null, clothing: null },
    rightArm: { armor: null, clothing: null },
    leftLeg: { armor: null, clothing: null },
    rightLeg: { armor: null, clothing: null },
  });
  const [caps, setCaps] = useState(0);
  const [currentHealth, setCurrentHealth] = useState(0);

  // Ключ: canonicalInstanceId / uniqueId / stackId -> значение: модифицированный предмет (полный объект)
  // Используем Map для быстрого поиска
  const [modifiedItems, setModifiedItems] = useState(new Map());

  const [availablePerkAttributePoints, setAvailablePerkAttributePoints] = useState(0);
  const [luckPoints, setLuckPoints] = useState(0);
  const [maxLuckPoints, setMaxLuckPoints] = useState(0);
  const [attributesSaved, setAttributesSaved] = useState(false);
  const [skillsSaved, setSkillsSaved] = useState(false);
  const [selectedPerks, setSelectedPerks] = useState([]);
  const [carryWeight, setCarryWeight] = useState(150 + (10 * attributes.find(a => a.name === 'СИЛ')?.value || 0));
  const [meleeBonus, setMeleeBonus] = useState(0);
  const [initiative, setInitiative] = useState(0);
  const [defense, setDefense] = useState(1);

  // ---------------- ИСПРАВЛЕННАЯ ЛОГИКА КЛЮЧЕЙ ----------------
  // Возвращает каноничный ключ для предмета, который будем использовать в modifiedItems
  const getCanonicalItemKey = (item) => {
    if (!item) return null;

    // 1) если уже есть instanceId — используем его (приоритет)
    if (item.instanceId) return item.instanceId;

    // 2) если есть uniqueId и пометка modified — используем её
    if (item.uniqueId && item.uniqueId.startsWith('modified-')) return item.uniqueId;

    // 3) если это модифицированное оружие (есть appliedModIds) — генерируем через generateWeaponInstanceId
    if (item.appliedModIds && item.appliedModIds.length > 0 && (item.weaponId || item.id || item.code)) {
      const baseWeaponId = item.weaponId || item.id || item.code;
      const key = generateWeaponInstanceId(baseWeaponId, item.appliedModIds);
      // Сохраняем instanceId в объект для будущего использования
      if (!item.instanceId) {
        item.instanceId = key;
      }
      return key;
    }

    // 4) для НЕМОДИФИЦИРОВАННОГО оружия — тоже генерируем instanceId с пустыми модами
    if ((item.weaponId || item.id || item.code) && (!item.appliedModIds || item.appliedModIds.length === 0)) {
      const baseWeaponId = item.weaponId || item.id || item.code;
      const key = generateWeaponInstanceId(baseWeaponId, []); // все слоты '0'
      // Сохраняем instanceId в объект для будущего использования
      if (!item.instanceId) {
        item.instanceId = key;
      }
      return key;
    }

    // 5) для других предметов — используем itemId, uniqueId или название
    if (item.itemId) return item.itemId;
    if (item.uniqueId) return item.uniqueId;
    
    // Fallback для стэков — используем название как ключ
    return `inv-stack-${item.Name || item.Название || item.name || JSON.stringify(item)}`;
  };

  // Возвращает "оригинальный" базовый id (например weapon_xxx) если возможно
  const getBaseWeaponId = (item) => {
    if (item.weaponId) return item.weaponId;
    if (item.id) return item.id;
    if (item.code) return item.code;

    // Попытка распарсить instanceId или uniqueId
    const candidate = item.instanceId || item.uniqueId;
    if (candidate && typeof candidate === 'string' && candidate.includes('_')) {
      const parts = candidate.split('_');
      if (parts.length >= 2) {
        return `${parts[0]}_${parts[1]}`; // weapon_xxx
      }
    }
    return null;
  };

  // ---------------- ИСПРАВЛЕННАЯ ФУНКЦИЯ: Изменение количества предмета в инвентаре ----------------
  const adjustItemQuantity = (item, amount) => {
    if (!item || amount === 0) return false;

    const keyToMatch = getCanonicalItemKey(item);
    const itemName = item.Name || item.Название || item.name;

    console.log(`[CharacterContext] Adjusting ${itemName || keyToMatch} by ${amount}`);

    let finalQuantity = 'unknown';
    
    setEquipment(prev => {
      if (!prev?.items) {
        if (amount <= 0) return prev;
        finalQuantity = Math.max(1, amount);
        return { 
          ...prev, 
          items: [{ 
            ...item, 
            quantity: finalQuantity,
            itemType: item.itemType || 'misc' // Автоматическое определение типа
          }] 
        };
      }

      const newItems = [...prev.items];
      const itemIndex = newItems.findIndex(i => 
        (i.instanceId === keyToMatch) ||
        (i.uniqueId && item.uniqueId && i.uniqueId === item.uniqueId) ||
        ((i.Name || i.Название || i.name) === itemName)
      );

      if (itemIndex !== -1) {
        const newQuantity = (newItems[itemIndex].quantity || 1) + amount;
        if (newQuantity <= 0) {
          newItems.splice(itemIndex, 1); // Удаляем, если <=0
          finalQuantity = 'removed';
        } else {
          newItems[itemIndex] = { 
            ...newItems[itemIndex], 
            quantity: newQuantity 
          };
          finalQuantity = newQuantity;
        }
      } else if (amount > 0) {
        // Добавляем новый предмет
        newItems.push({ 
          ...item, 
          quantity: amount,
          itemType: item.itemType || 'misc'
        });
        finalQuantity = amount;
      } else {
        finalQuantity = 'not found';
      }

      return { ...prev, items: newItems };
    });

    console.log(`[CharacterContext] Item adjusted: ${itemName || keyToMatch}, new quantity: ${finalQuantity}`);
    return true;
  };

  // ---------------- ПОЛУЧЕНИЕ МОДИФИЦИРОВАННОГО ПРЕДМЕТА ----------------
  const getModifiedItem = (item) => {
    if (!item) return item;

    // Если item уже содержит полные данные модификаций — возвращаем как есть
    if (item.appliedModIds && item.appliedModIds.length > 0) {
      return item;
    }

    // Получаем каноничный ключ
    const key = getCanonicalItemKey(item);

    // Ищем по каноничному ключу в modifiedItems
    const byKey = modifiedItems.get(key);
    if (byKey) return byKey;

    // Fallback: если item имеет uniqueId — ищем по нему
    if (item.uniqueId && modifiedItems.get(item.uniqueId)) {
      return modifiedItems.get(item.uniqueId);
    }

    // Если ничего не нашли — возвращаем оригинальный item
    return item;
  };

  // ---------------- СОХРАНЕНИЕ МОДИФИЦИРОВАННОГО ПРЕДМЕТА ----------------
  const saveModifiedItem = (originalItem, modifiedItem) => {
    if (!modifiedItem) return;

    // Генерируем каноничный ключ для modifiedItem
    let key = getCanonicalItemKey(modifiedItem);

    // Если ключ не удалось сгенерировать — используем fallback
    if (!key) {
      key = `modified-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      modifiedItem.uniqueId = key;
    }

    // Сохраняем копию объекта (чтобы избежать мутаций извне)
    setModifiedItems(prev => {
      const next = new Map(prev);
      next.set(key, { ...modifiedItem });
      return next;
    });

    // Лог для отладки
    console.log('[CharacterContext] saveModifiedItem -> key:', key, { originalItem, modifiedItem });
  };

  const removeModifiedItem = (item) => {
    const key = getCanonicalItemKey(item);
    if (key) {
      setModifiedItems(prev => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
    }
  };

  // ---------------- ИСПРАВЛЕННАЯ ЭКИПИРОВКА ОРУЖИЯ ----------------
  // Экипировка оружия
  const handleEquipWeapon = (weaponToEquip, forceSlotIndex = null) => {
    const displayWeapon = getModifiedItem(weaponToEquip) || weaponToEquip;

    // Генерируем instanceId если его нет
    const instanceId = getCanonicalItemKey(displayWeapon);

    const itemName = displayWeapon.Name || displayWeapon.Название || displayWeapon.name;

    // Проверяем количество в инвентаре
    const totalOwned = equipment?.items?.reduce((total, i) => {
      // Для оружия сравниваем по weaponId, для остальных предметов - по имени
      const itemId = i.weaponId || i.id;
      const matches = i.instanceId === instanceId ||
                     (itemId && displayWeapon.weaponId ? itemId === displayWeapon.weaponId : false) ||
                     (i.Name || i.Название || i.name) === itemName;
      if (matches) {
        return total + (i.quantity || 1);
      }
      return total;
    }, 0) || 0;

    const alreadyEquippedCount = equippedWeapons.filter(w =>
      w && ((w.weaponId && displayWeapon.weaponId) ? w.weaponId === displayWeapon.weaponId : ((w.Name || w.Название || w.name) === itemName))
    ).length;

    if (totalOwned <= alreadyEquippedCount) {
      console.log('[CharacterContext] Not enough weapons to equip:', { itemName, totalOwned, alreadyEquippedCount });
      return false;
    }

    let targetSlotIndex;

    if (forceSlotIndex !== null) {
      // Принудительная замена в указанном слоте
      targetSlotIndex = forceSlotIndex;
    } else {
      // Ищем свободный слот
      const freeSlotIndex = equippedWeapons.findIndex(w => w === null);
      if (freeSlotIndex === -1) {
        console.log('[CharacterContext] No free weapon slots');
        return false;
      }
      targetSlotIndex = freeSlotIndex;
    }

    // Если forceSlotIndex и слот занят — сначала unequip старое
    if (forceSlotIndex !== null) {
      const oldWeapon = equippedWeapons[targetSlotIndex];
      if (oldWeapon) {
        handleUnequipWeapon(oldWeapon, targetSlotIndex);
      }
    }

    // Экипируем новое
    const weaponForEquip = {
      ...displayWeapon,
      itemType: 'weapon',
      instanceId: instanceId
    };

    setEquippedWeapons(prev => {
      const newEquipped = [...prev];
      newEquipped[targetSlotIndex] = weaponForEquip;
      return newEquipped;
    });

    // Уменьшаем количество в инвентаре
    adjustItemQuantity(weaponToEquip, -1);

    console.log('[CharacterContext] Weapon equipped:', { weaponForEquip, slot: targetSlotIndex });
    return true;
  };

  // ---------------- ИСПРАВЛЕННОЕ СНЯТИЕ ОРУЖИЯ ----------------
  // Снятие оружия (ИСПРАВЛЕНО — теперь правильно добавляет в инвентарь)
  const handleUnequipWeapon = (weaponToUnequip, slotIndex) => {
    if (!weaponToUnequip || slotIndex === undefined) {
      console.log('[CharacterContext] Invalid unequip parameters');
      return false;
    }
    
    // Получаем отображаемый вариант
    const displayWeapon = getModifiedItem(weaponToUnequip) || weaponToUnequip;
    
    // Генерируем instanceId для возврата в инвентарь
    const instanceId = getCanonicalItemKey(displayWeapon);
    
    const weaponForInventory = {
      ...displayWeapon,
      itemType: 'weapon',
      instanceId: instanceId,
      quantity: 1, // Для adjust это не важно, но на всякий
      isEquipped: false
    };
    
    // Очищаем слот
    setEquippedWeapons(prev => {
      const newEquipped = [...prev];
      newEquipped[slotIndex] = null;
      return newEquipped;
    });
    
    // Добавляем в инвентарь через adjust
    adjustItemQuantity(weaponForInventory, 1);
    
    console.log('[CharacterContext] Weapon unequipped:', { weaponForInventory, slotIndex });
    return true;
  };

  // ---------------- Управление патронами ----------------
  const getAmmoCount = (ammoId) => {
    if (!ammoId || !equipment?.items) return 0;

    const ammoItem = equipment.items.find(item =>
      item.id === ammoId ||
      item.ammoId === ammoId ||
      item.Name === ammoId ||
      item.name === ammoId ||
      item.Название === ammoId
    );

    return ammoItem?.quantity || 0;
  };

  const adjustAmmoCount = (ammoId, amount) => {
    if (!ammoId) return false;

    const currentCount = getAmmoCount(ammoId);
    const newCount = Math.max(0, currentCount + amount);

    setEquipment(prev => {
      if (!prev?.items) return prev;

      const newItems = [...prev.items];
      const ammoIndex = newItems.findIndex(item =>
        item.id === ammoId ||
        item.ammoId === ammoId ||
        item.Name === ammoId ||
        item.name === ammoId ||
        item.Название === ammoId
      );

      if (ammoIndex !== -1) {
        const item = newItems[ammoIndex];
        if (newCount <= 0) {
          // Удаляем предмет из инвентаря
          newItems.splice(ammoIndex, 1);
        } else {
          // Обновляем количество
          newItems[ammoIndex] = { ...item, quantity: newCount };
        }
      } else if (newCount > 0) {
        // Если патронов не было, но нужно добавить
        newItems.push({
          id: ammoId,
          itemType: 'ammo',
          quantity: newCount
        });
      }

      return { ...prev, items: newItems };
    });

    console.log(`[CharacterContext] Ammo adjusted: ${ammoId}, ${currentCount} -> ${newCount}`);
    return true;
  };

  // ---------------- Управление атрибутами/перками ----------------
  const addPerkAttributePoints = (points) => {
    setAvailablePerkAttributePoints(prev => prev + points);
  };

  const commitAttributeChanges = (newAttributes, pointsSpent) => {
    setAttributes(newAttributes);
    setAvailablePerkAttributePoints(prev => prev - pointsSpent);

    const newLuck = getLuckPoints(newAttributes);
    setMaxLuckPoints(newLuck);
    setLuckPoints(prevLuck => Math.min(prevLuck, newLuck));
    
    setCarryWeight(calculateCarryWeight(newAttributes, trait));
    setMeleeBonus(calculateMeleeBonus(newAttributes));
    setInitiative(calculateInitiative(newAttributes));
    setDefense(calculateDefense(newAttributes));
    
    const newMaxHealth = calculateMaxHealth(newAttributes, level);
    setCurrentHealth(prevHealth => Math.min(prevHealth, newMaxHealth));
  };

  const resetCharacter = (preserveOrigin = false) => {
    const initialAttributes = createInitialAttributes();
    setAttributes(initialAttributes);
    setSkills(ALL_SKILLS.map(s => ({...s, value: 0})));
    setSelectedSkills([]);
    setExtraTaggedSkills([]);
    setForcedSelectedSkills([]);
    setAttributesSaved(false);
    setSkillsSaved(false);
    const initialLuck = getLuckPoints(initialAttributes);
    setMaxLuckPoints(initialLuck);
    setLuckPoints(initialLuck);
    if (!preserveOrigin) setOrigin(null);
    setTrait(null);
    setEquipment({ items: [] }); // ← ИСПРАВЛЕНИЕ: Сбрасываем только items
    setEffects([]);
    setEquippedWeapons([null, null]);
    setEquippedArmor({
      head: { armor: null, clothing: null },
      body: { armor: null, clothing: null },
      leftArm: { armor: null, clothing: null },
      rightArm: { armor: null, clothing: null },
      leftLeg: { armor: null, clothing: null },
      rightLeg: { armor: null, clothing: null },
    });
    setCaps(0);
    setSelectedPerks([]);
    setMeleeBonus(0);
    setInitiative(calculateInitiative(initialAttributes));
    setDefense(calculateDefense(initialAttributes));
    
    const currentMaxHealth = calculateMaxHealth(initialAttributes, level);
    setCurrentHealth(currentMaxHealth);
    
    setModifiedItems(new Map());
  };

  const value = {
    level, setLevel,
    attributes, setAttributes,
    skills, setSkills,
    selectedSkills, setSelectedSkills,
    extraTaggedSkills, setExtraTaggedSkills,
    forcedSelectedSkills, setForcedSelectedSkills,
    origin, setOrigin,
    trait, setTrait,
    equipment, setEquipment,
    effects, setEffects,
    equippedWeapons, setEquippedWeapons,
    equippedArmor, setEquippedArmor,
    caps, setCaps,
    currentHealth, setCurrentHealth,
    luckPoints, setLuckPoints,
    maxLuckPoints, setMaxLuckPoints,
    attributesSaved, setAttributesSaved,
    skillsSaved, setSkillsSaved,
    selectedPerks, setSelectedPerks,
    modifiedItems, setModifiedItems,
    carryWeight,
    meleeBonus,
    initiative,
    defense,
    // helpers
    hasTrait: (traitName) => !!(trait && (trait.name === traitName)),
    getItemId: getCanonicalItemKey,
    getModifiedItem,
    saveModifiedItem,
    removeModifiedItem,
    calculateMaxHealth,
    // ЭКИПИРОВКА/СНЯТИЕ
    handleEquipWeapon,
    handleUnequipWeapon,
    // ИСПРАВЛЕННАЯ ФУНКЦИЯ ДЛЯ СТЭКОВАНИЯ
    adjustItemQuantity,
    resetCharacter,
    availablePerkAttributePoints,
    addPerkAttributePoints,
    commitAttributeChanges,
    // ammo helpers
    getAmmoCount,
    adjustAmmoCount,
    // perks helpers
    meetsPerkRequirements: (perk) => meetsPerkRequirements(perk, attributes, level),
    getPerkUnmetReasons: (perk) => getPerkUnmetReasons(perk, attributes, level),
    annotatePerks: (perks) => annotatePerks(perks, attributes, level),
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  return useContext(CharacterContext);
};