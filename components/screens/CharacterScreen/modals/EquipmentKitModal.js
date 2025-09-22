import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { resolveLoot } from '../logic/ammoLogic.js';
import { resolveRandomLoot, supportedLootTags } from '../logic/RandomLootLogic.js';

import allWeaponsData from '../../../../assets/Equipment/weapons.json';
import allArmor from '../../../../assets/Equipment/armor.json';
import allClothes from '../../../../assets/Equipment/Clothes.json';
import allMisc from '../../../../assets/Equipment/miscellaneous.json';
import allAmmoData from '../../../../assets/Equipment/ammo.json';
import allChems from '../../../../assets/Equipment/chems.json';
import weaponMods from '../../../../assets/Equipment/weapon_mods.json';

import {
  getModifiedWeaponName,
  applyMultipleModifications,
  getWeaponModifications,
  generateWeaponInstanceId,
} from '../../InventoryScreen/modals/weaponModificationUtils';

const safeMatch = (value, regex) => (typeof value === 'string' ? value.match(regex) : null);

const getWeaponById = (weaponId) => allWeaponsData.find(w => w.id === weaponId);
const getModificationByIdLocal = (id) => weaponMods.find(m => m.id === id);
const allArmorItems = allArmor.armor?.flatMap(a => a.items) || [];
const allClothesItems = allClothes.clothes?.flatMap(c => c.items) || [];
const allMiscItems = allMisc.miscellaneous?.flatMap(category => category.items) || [];
const allAmmoItems = allAmmoData || [];

const kitCategories = [
  { key: 'armor', title: 'Броня' },
  { key: 'clothing', title: 'Одежда' },
  { key: 'weapons', title: 'Оружие' },
  { key: 'miscellaneous', title: 'Разное' },
  { key: 'loot', title: 'Прочее' },
];

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ padding: 20 }}>
          <Text>Что-то пошло не так. Попробуйте снова или обратитесь к разработчику.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const EquipmentKitModal = ({ visible, onClose, equipmentKits, onSelectKit }) => {
  const [expandedKit, setExpandedKit] = useState(null);
  const [selectedChoices, setSelectedChoices] = useState({});
  const [calculatedKits, setCalculatedKits] = useState([]);

  // console.log('[EquipmentKitModal] Render with visible:', visible);

  useEffect(() => {
    if (visible && equipmentKits?.length > 0) {
      console.log('[EquipmentKitModal] open with kits:', equipmentKits?.map(k => k.name));
      console.log('[EquipmentKitModal] supportedLootTags:', supportedLootTags);
      const newCalculatedKits = equipmentKits.map(kit => {
        const newKit = JSON.parse(JSON.stringify(kit));

        kitCategories.forEach(({ key }) => {
          if (newKit[key]) {
            const supportedFormulaTags = ['ammo', 'caps', 'basicmaterial'];
            newKit[key].forEach((item, idx) => {
              if (item.type === 'fixed') {
                const capsTagMatch = safeMatch(item.name, /(\d+)\s*<caps>/);
                if (capsTagMatch) {
                  const capsQuantity = parseInt(capsTagMatch[1], 10);
                  item.name = 'Крышки';
                  item.quantity = capsQuantity;
                  item.resolved = true;
                  item.itemType = 'currency';
                  console.log('Обработаны крышки:', item);
                } else {
                  const tagMatch = safeMatch(item.name, /<(\w+)>/);
                  if (tagMatch) {
                    const tag = (tagMatch[1] || '').toLowerCase();
                    console.log('[EquipmentKitModal] Resolving loot formula:', { category: key, index: idx, name: item.name, tag });
                    const randLoot = resolveRandomLoot(item.name);
                    console.log('[EquipmentKitModal] Resolved loot result:', randLoot);
                    if (randLoot) {
                      Object.assign(item, randLoot);
                      item.resolved = true;
                    } else if (supportedFormulaTags.includes(tag)) {
                      const resolvedLoot = resolveLoot(item.name, {});
                      console.log('[EquipmentKitModal] Resolved formula result:', resolvedLoot);
                      if (resolvedLoot) Object.assign(item, resolvedLoot);
                    } else {
                      console.warn('[EquipmentKitModal] Unhandled formula tag:', tag, 'for', item.name);
                    }
                  }
                }
                if (!item.resolved) {
                  if (item.weaponId) {
                    const weaponData = getWeaponById(item.weaponId);
                    if (weaponData) {
                      item.displayName = weaponData.Name;
                      if (!item.name) item.name = weaponData.Name;
                    }
                    if (item.ammunition) {
                      const resolvedAmmo = resolveLoot(item.ammunition, { weaponId: item.weaponId });
                      if (resolvedAmmo) {
                        item.resolvedAmmunition = {
                          ...resolvedAmmo,
                          itemType: 'ammo'
                        };
                      }
                    }
                  }
                  let weaponId = item.weaponCode || item.code || item.baseWeaponCode;
                  const modsFromOption = item.modCodes || item.mods || null;
                  const appliedModsMap = item.appliedMods || null;
                  if (weaponId) {
                    const baseWeapon = getWeaponById(weaponId);
                    if (baseWeapon) {
                      const modEntries = [];
                      if (Array.isArray(modsFromOption)) {
                        modsFromOption.forEach(id => {
                          const modData = getModificationByIdLocal(id) || getModificationByCode(id, 'light');
                          if (modData) modEntries.push({ ...modData, category: modData.Slot });
                        });
                      }
                      if (appliedModsMap && typeof appliedModsMap === 'object') {
                        Object.entries(appliedModsMap).forEach(([category, id]) => {
                          const modData = getModificationByIdLocal(id) || getModificationByCode(id, 'light');
                          if (modData) modEntries.push({ ...modData, category });
                        });
                      }
                      item.displayName = modEntries.length > 0
                        ? getModifiedWeaponName(baseWeapon, modEntries)
                        : baseWeapon.Name;
                      if (!item.name) item.name = item.displayName;
                      item.itemType = 'weapon';
                    }
                  }
                }
              }
              if (item.type === 'choice') {
                item.options.forEach(option => {
                  if (option.weaponId) {
                    const weaponData = getWeaponById(option.weaponId);
                    if (weaponData) {
                      option.displayName = weaponData.Name;
                      if (!option.name) option.name = weaponData.Name;
                    }
                    if (option.ammunition) {
                      const resolvedAmmo = resolveLoot(option.ammunition, { weaponId: option.weaponId });
                      if (resolvedAmmo) {
                        option.resolvedAmmunition = {
                          ...resolvedAmmo,
                          itemType: 'ammo'
                        };
                      }
                    }
                  }
                  let weaponId = option.weaponCode || option.code || option.baseWeaponCode;
                  const modsFromOption = option.modCodes || option.mods || null;
                  const appliedModsMap = option.appliedMods || null;

                  if (weaponId) {
                    const baseWeapon = getWeaponById(weaponId);
                    if (baseWeapon) {
                      const modEntries = [];
                      if (Array.isArray(modsFromOption)) {
                        modsFromOption.forEach(id => {
                          const modData = getModificationByIdLocal(id) || getModificationByCode(id, 'light');
                          if (modData) modEntries.push({ ...modData, category: modData.Slot });
                        });
                      }
                      if (appliedModsMap && typeof appliedModsMap === 'object') {
                        Object.entries(appliedModsMap).forEach(([category, id]) => {
                          const modData = getModificationByIdLocal(id) || getModificationByCode(id, 'light');
                          if (modData) modEntries.push({ ...modData, category });
                        });
                      }
                      option.displayName = modEntries.length > 0
                        ? getModifiedWeaponName(baseWeapon, modEntries)
                        : baseWeapon.Name;
                      if (!option.name) option.name = option.displayName;
                      option.itemType = 'weapon';
                    }
                  } else {
                    const modsBySlot = {};
                    weaponMods.forEach(mod => {
                      const slot = mod.Slot || 'unknown';
                      if (!modsBySlot[slot]) modsBySlot[slot] = [];
                      modsBySlot[slot].push(mod);
                    });
                    const allMods = (typeof getWeaponModifications === 'function' && getWeaponModifications()) || modsBySlot;
                    if (!allMods || Object.keys(allMods).length === 0) {
                      console.warn('[EquipmentKitModal] No weapon modifications data available');
                    }
                    const prefixToCode = {};
                    Object.values(allMods).forEach(categoryMods => {
                      categoryMods.forEach(mod => {
                        if (mod.Prefix) {
                          prefixToCode[mod.Prefix] = mod.id;
                        }
                      });
                    });
                    const knownPrefixes = Object.keys(prefixToCode);
                    const matchedPrefix = knownPrefixes.find(p => option.name && option.name.startsWith(p + ' '));
                    if (matchedPrefix) {
                      const baseName = option.name.substring((matchedPrefix + ' ').length);
                      const baseWeapon = allWeaponsData.find(w => w.Name === baseName);
                      if (baseWeapon && baseWeapon.id) {
                        weaponId = baseWeapon.id;
                        option.weaponCode = weaponId;
                        option.modCodes = [prefixToCode[matchedPrefix]];
                        const modData = getModificationByIdLocal(prefixToCode[matchedPrefix]) || getModificationByCode(prefixToCode[matchedPrefix], 'light');
                        option.displayName = getModifiedWeaponName(baseWeapon, modData ? [{ ...modData, category: modData.Slot }] : []);
                      }
                    } else if (option.name === 'Гладкоствольный карабин с болтовым затвором') {
                      const baseWeapon = allWeaponsData.find(w => w.id === 'weapon_011');
                      if (baseWeapon) {
                        weaponId = baseWeapon.id;
                        option.weaponCode = weaponId;
                        const stdId = 'mod_004';
                        option.modCodes = [stdId];
                        const stdMod = getModificationByIdLocal(stdId) || getModificationByCode(stdId, 'light');
                        option.displayName = getModifiedWeaponName(baseWeapon, stdMod ? [{ ...stdMod, category: stdMod.Slot }] : []);
                      }
                    }
                  }
                  if (option.ammunition && weaponId) {
                    const resolvedAmmo = resolveLoot(option.ammunition, { weaponId: weaponId });
                    if (resolvedAmmo) {
                      option.resolvedAmmunition = {
                        ...resolvedAmmo,
                        itemType: 'ammo'
                      };
                    }
                  }
                });
              } else if (item.type === 'fixed' && item.ammunition) {
                const weaponId = item.weaponCode || item.code || item.baseWeaponCode;
                if (weaponId) {
                  const resolvedAmmo = resolveLoot(item.ammunition, { weaponId: weaponId });
                  if (resolvedAmmo) {
                    item.resolvedAmmunition = {
                      ...resolvedAmmo,
                      itemType: 'ammo'
                    };
                  }
                }
              }
            });
          }
        });
        return newKit;
      });
      setCalculatedKits(newCalculatedKits);

      const initialChoices = {};
      newCalculatedKits.forEach(kit => {
        kitCategories.forEach(({ key }) => {
          if (kit[key]) {
            kit[key].forEach((item, index) => {
              if (item?.type === 'choice') {
                const count = item.count || 1;
                const firstOption = item.options[0];
                if (firstOption.group) {
                  initialChoices[`${kit.name}-${key}-${index}`] = `group-${firstOption.group.map(item => item.name).join('+')}`;
                } else {
                  // Для множественного выбора инициализируем как массив
                  if (count > 1) {
                    initialChoices[`${kit.name}-${key}-${index}`] = [firstOption.name];
                  } else {
                    initialChoices[`${kit.name}-${key}-${index}`] = firstOption.name;
                  }
                }
              }
            });
          }
        });
      });
      setSelectedChoices(initialChoices);
    }
  }, [visible, equipmentKits]);

  if (!equipmentKits) return null;

  const handleSelectChoice = (kitName, categoryKey, itemIndex, option, isMultiSelect = false) => {
    const isGroup = !!option.group;
    const groupKey = isGroup ? `group-${option.group.map(i => i.name).join('+')}` : option.name;

    setSelectedChoices(prev => {
      const currentKey = `${kitName}-${categoryKey}-${itemIndex}`;
      const currentSelection = prev[currentKey];

      if (isMultiSelect) {
        // Логика множественного выбора для чекбоксов
        if (Array.isArray(currentSelection)) {
          const isAlreadySelected = currentSelection.includes(groupKey);
          if (isAlreadySelected) {
            // Убираем из выбора
            return {
              ...prev,
              [currentKey]: currentSelection.filter(key => key !== groupKey)
            };
          } else {
            // Добавляем в выбор
            return {
              ...prev,
              [currentKey]: [...currentSelection, groupKey]
            };
          }
        } else {
          // Инициализация массива для множественного выбора
          return {
            ...prev,
            [currentKey]: [groupKey]
          };
        }
      } else {
        // Логика одиночного выбора для радио-кнопок
        return { ...prev, [currentKey]: groupKey };
      }
    });
  };

  const processSingleItem = (item, itemGroups) => {
    let instanceId = null;

    // Генерируем instanceId для оружия
    if (item.weaponId || item.weaponCode || item.code || item.baseWeaponCode) {
      const baseWeaponId = item.weaponId || item.weaponCode || item.code || item.baseWeaponCode;
      const modIds = [];

      // Собираем ID модификаций
      if (item.modCodes && Array.isArray(item.modCodes)) {
        modIds.push(...item.modCodes);
      }
      if (item.mods && Array.isArray(item.mods)) {
        modIds.push(...item.mods);
      }

      instanceId = generateWeaponInstanceId(baseWeaponId, modIds);
    } else if (item.itemType === 'weapon' && item.id) {
      // Для оружия без явного weaponId используем id
      instanceId = generateWeaponInstanceId(item.id, []);
    }

    // Если instanceId не сгенерирован, используем уникальный ключ на основе имени и типа
    if (!instanceId) {
      const itemKey = `${item.itemType || 'unknown'}_${item.name || item.Name || 'unnamed'}`;
      instanceId = `custom_${itemKey}`;
    }

    // Если предмет уже есть в группах, увеличиваем количество
    if (itemGroups.has(instanceId)) {
      itemGroups.get(instanceId).quantity += item.quantity || 1;
    } else {
      // Добавляем новый предмет
      itemGroups.set(instanceId, {
        item: { ...item, instanceId },
        quantity: item.quantity || 1
      });
    }
  };

  const handleSelectKit = (kit) => {
    console.log('[EquipmentKitModal] Selecting kit:', kit?.name);
    const itemGroups = new Map(); // Ключ - instanceId, значение - {item, quantity}

    kitCategories.forEach(({ key }) => {
      if (kit[key]) {
        kit[key].forEach((item, index) => {
          let chosenItem = item.type === 'fixed' ? item : null;
          let chosenItems = null; // Объявляем переменную для множественного выбора
          if (item.type === 'choice') {
            const selectedKeys = selectedChoices[`${kit.name}-${key}-${index}`];
            if (Array.isArray(selectedKeys)) {
              // Множественный выбор - берем все выбранные элементы
              chosenItems = selectedKeys.map(selectedKey => {
                return item.options.find(opt => {
                  const isGroup = !!opt.group;
                  const groupKey = isGroup ? `group-${opt.group.map(i => i.name).join('+')}` : opt.name;
                  return groupKey === selectedKey;
                });
              }).filter(Boolean);
            } else if (selectedKeys) {
              // Одиночный выбор - берем один элемент
              chosenItem = item.options.find(opt => {
                const isGroup = !!opt.group;
                const groupKey = isGroup ? `group-${opt.group.map(i => i.name).join('+')}` : opt.name;
                return groupKey === selectedKeys;
              });
            }
          }

          if (chosenItem || (chosenItems && chosenItems.length > 0)) {
            (chosenItems || [chosenItem]).forEach(chosenItem => {
              if (typeof chosenItem?.name === 'string') {
                const fm = safeMatch(chosenItem.name, /<(\w+)>/);
                if (fm) {
                  const t = (fm[1] || '').toLowerCase();
                  const rl = resolveRandomLoot(chosenItem.name);
                  if (rl) {
                    Object.assign(chosenItem, rl);
                    chosenItem.resolved = true;
                  }
                }
              }

              if (chosenItem.group) {
                // Обрабатываем каждый элемент из group массива
                chosenItem.group.forEach(groupItem => {
                  const groupItemCopy = { ...groupItem, quantity: groupItem.quantity || 1 };
                  processSingleItem(groupItemCopy, itemGroups);
                });
              } else if (chosenItem.itemType === 'loot' || chosenItem.itemType === 'currency' || chosenItem.itemType === 'chem') {
                processSingleItem(chosenItem, itemGroups);
              } else {
                const itemCopy = { ...chosenItem, quantity: chosenItem.quantity || 1 };
                processSingleItem(itemCopy, itemGroups);
              }
              // Не добавляем resolvedAmmunition как отдельные предметы - они будут обработаны вместе с оружием
            });
          }
        });
      }
    });

    // Преобразуем сгруппированные предметы в массив
    const rawItems = Array.from(itemGroups.values()).map(({ item, quantity }) => ({
      ...item,
      quantity
    }));

    if (kit.resolvedLoot) {
      rawItems.push(...kit.resolvedLoot.filter(Boolean));
    }
    console.log('[EquipmentKitModal] rawItems before enrich:', rawItems);

    const allItems = rawItems.flatMap(item => {
      if (item.itemType === 'ammo') {
        let ammoData = null;
        
        // Ищем по ID если item.name содержит ID патрона
        if (item.name && item.name.startsWith('ammo_')) {
          ammoData = allAmmoItems.find(a => a.id === item.name);
        }
        
        // Если не нашли по ID, ищем по имени
        if (!ammoData) {
          ammoData = allAmmoItems.find(a => 
            a.name === item.name || 
            a.Name === item.name ||
            a.Name === item.Name ||
            a.id === item.id
          );
        }
        
        if (ammoData) {
          return [{
            ...ammoData,
            ...item,
            id: ammoData.id,
            Name: ammoData.Name || ammoData.name,
            name: ammoData.Name || ammoData.name,
            quantity: item.quantity || 1,
            itemType: 'ammo',
            Weight: ammoData.Weight || ammoData.weight || item.Weight || 0,
            Cost: ammoData.Cost || ammoData.cost || item.Cost || 0
          }];
        }
        
        return [{
          ...item,
          id: item.id || item.name,
          Name: item.Name || item.name,
          name: item.Name || item.name,
          quantity: item.quantity || 1,
          itemType: 'ammo',
          Weight: item.Weight || item.weight || 0,
          Cost: item.Cost || item.cost || 0
        }];
      }

      if (item.itemType === 'loot') {
        return [{ ...item, Name: item.Name || item.name, quantity: item.quantity || 1 }];
      }
      if (item.itemType === 'chem' && item.Weight !== undefined && item.Cost !== undefined) {
        return [{ ...item, Name: item.Name || item.name, quantity: item.quantity || 1 }];
      }

      const capsTagMatch = safeMatch(item.name, /(\d+)\s*<caps>/);
      if (capsTagMatch) {
        const capsQuantity = parseInt(capsTagMatch[1], 10);
        return [{
          name: 'Крышки',
          Name: 'Крышки',
          quantity: capsQuantity,
          itemType: 'currency',
          Cost: 1,
          Weight: 0
        }];
      }

      if (item.weaponId) {
        const weaponData = getWeaponById(item.weaponId);
        if (weaponData) {
          const weaponObj = {
            ...weaponData,
            quantity: item.quantity || 1,
            itemType: 'weapon',
            weaponId: item.weaponId,
            id: weaponData.id || item.weaponId, // Добавляем id как fallback
            instanceId: item.instanceId || weaponData.id || item.weaponId // Добавляем instanceId как fallback
          };

          // Добавляем патроны если есть resolvedAmmunition
          if (item.resolvedAmmunition) {
            weaponObj.resolvedAmmunition = item.resolvedAmmunition;
          }

          console.log('[EquipmentKitModal] Built weapon object from weaponId:', weaponObj);

          // Возвращаем оружие и патроны как отдельные предметы
          const resultItems = [weaponObj];

          // Добавляем патроны если есть
          if (item.resolvedAmmunition) {
            resultItems.push({
              ...item.resolvedAmmunition,
              itemType: 'ammo',
              Name: item.resolvedAmmunition.Name || item.resolvedAmmunition.name,
              name: item.resolvedAmmunition.Name || item.resolvedAmmunition.name,
              quantity: item.resolvedAmmunition.quantity || 1
            });
          }

          return resultItems;
        } else {
          console.warn('[EquipmentKitModal] Weapon not found by weaponId:', item.weaponId);
        }
      }

      const weaponId = item.weaponCode || item.code || item.baseWeaponCode;
      const modsFromOption = item.modCodes || item.mods || null;
      const appliedModsMap = item.appliedMods || null;

      if (weaponId) {
        const baseWeapon = getWeaponById(weaponId);
        if (baseWeapon) {
          const modEntries = [];
          if (Array.isArray(modsFromOption)) {
            modsFromOption.forEach(id => {
              const modData = getModificationByIdLocal(id) || getModificationByCode(id, 'light');
              if (modData) modEntries.push({ ...modData, category: modData.Slot });
            });
          }
          if (appliedModsMap && typeof appliedModsMap === 'object') {
            Object.entries(appliedModsMap).forEach(([category, id]) => {
              const modData = getModificationByIdLocal(id) || getModificationByCode(id, 'light');
              if (modData) modEntries.push({ ...modData, category });
            });
          }

          let finalWeapon = { ...baseWeapon };
          if (modEntries.length > 0) {
            const modsForApply = modEntries.map(m => ({ category: m.category, data: m }));
            finalWeapon = applyMultipleModifications(baseWeapon, modsForApply);
          }

          const finalAppliedMods = {};
          modEntries.forEach(m => {
            if (m.category && m.id) finalAppliedMods[m.category] = m.id;
          });
          const weaponIdStr = [weaponId, ...Object.entries(finalAppliedMods).map(([cat, id]) => `${cat}=${id}`)].join('+');

          const weaponObj = {
            ...finalWeapon,
            code: weaponId,
            weaponId: weaponIdStr || weaponId, // Fallback если weaponIdStr пустой
            appliedMods: finalAppliedMods,
            quantity: item.quantity || 1,
            itemType: 'weapon',
            id: finalWeapon.id || weaponId, // Добавляем id как fallback
            instanceId: item.instanceId || finalWeapon.id || weaponId // Добавляем instanceId как fallback
          };
          
          console.log('[EquipmentKitModal] Built weapon object from code/mods:', weaponObj);
          
          // Возвращаем оружие и патроны как отдельные предметы
          const resultItems = [weaponObj];
          
          // Добавляем патроны если есть
          if (item.resolvedAmmunition) {
            resultItems.push({
              ...item.resolvedAmmunition,
              itemType: 'ammo',
              Name: item.resolvedAmmunition.Name || item.resolvedAmmunition.name,
              name: item.resolvedAmmunition.Name || item.resolvedAmmunition.name,
              quantity: item.resolvedAmmunition.quantity || 1
            });
          }
          
          return resultItems;
        } else {
          console.warn('[EquipmentKitModal] Base weapon not found by code:', weaponId);
          // Создаем оружие с минимальными данными как fallback
          const fallbackWeapon = {
            id: weaponId,
            quantity: item.quantity || 1,
            itemType: 'weapon',
            weaponId: weaponId,
            instanceId: weaponId,
            Weight: 0,
            Cost: 0
          };

          console.log('[EquipmentKitModal] Created fallback weapon:', fallbackWeapon);
          return [fallbackWeapon];
        }
      }

      let fullItemData = null;
      if (!weaponId) {
        fullItemData = allWeaponsData.find(i => i.Name === item.name);
        if (!fullItemData) fullItemData = allArmorItems.find(i => i.Name === item.name || i.name === item.name);
        if (!fullItemData) fullItemData = allClothesItems.find(i => i.Name === item.name || i.name === item.name);
        if (!fullItemData) fullItemData = allMiscItems.find(i => i.Name === item.name || i.name === item.name);
        if (!fullItemData) fullItemData = allAmmoItems.find(i => i.Name === item.name || i.name === item.name);
        if (!fullItemData) fullItemData = allChems.find(i => i.Name === item.name || i.name === item.name);
      }

      if (fullItemData) {
        const enriched = {
          ...fullItemData,
          ...item,
          Name: fullItemData.Name || fullItemData.name,
          Weight: fullItemData.Weight || fullItemData.weight || 0,
          Cost: fullItemData.Cost || fullItemData.cost || 0,
          quantity: item.quantity || 1,
          itemType: fullItemData.itemType || item.itemType
        };
        console.log('[EquipmentKitModal] Enriched non-weapon item:', enriched);
        return [enriched];
      }

      const passthrough = {
        ...item,
        Name: item.Name || item.name,
        Weight: item.Weight || item.weight || 0,
        Cost: item.Cost || item.cost || 0,
        quantity: item.quantity || 1
      };
      console.warn('[EquipmentKitModal] Passthrough item (no full data found):', passthrough);
      return [passthrough];
    }).filter(Boolean);
    console.log('[EquipmentKitModal] allItems after enrich:', allItems);

    const totalCaps = allItems.reduce((acc, item) => {
      if (item.itemType === 'currency' && item.name === 'Крышки') {
        console.log('Найдены крышки:', item.quantity);
        return acc + (item.quantity || 0);
      }
      return acc;
    }, 0);

    console.log('Всего крышек:', totalCaps);

    const finalItems = allItems.filter(item => item.itemType !== 'currency');
    console.log('[EquipmentKitModal] finalItems to inventory:', finalItems);

    const totalWeight = finalItems.reduce((acc, item) => {
      const weight = parseFloat(String(item.Weight || item.weight || 0).replace(',', '.')) || 0;
      return acc + (weight * (item.quantity || 1));
    }, 0);

    const totalPrice = finalItems.reduce((acc, item) => {
      const price = parseFloat(item.Cost || item.cost || 0) || 0;
      return acc + (price * (item.quantity || 1));
    }, 0);

    const payload = {
      name: kit.name,
      items: finalItems,
      weight: totalWeight,
      price: totalPrice,
      caps: totalCaps
    };
    console.log('[EquipmentKitModal] onSelectKit payload:', payload);
    onSelectKit(payload);
    onClose();
  };

  const toggleExpand = (kitName) => {
    setExpandedKit(k => (k === kitName ? null : kitName));
  };

  const renderItemDetails = (item) => {
    if (item.itemType === 'ammo') {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text>{item.Name || item.name}</Text>
          <Text style={styles.ammoText}>
            ({item.quantity}шт.)
          </Text>
        </View>
      );
    }
    
    const lootDetails = item.resolvedAmmunition;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>{item.displayName || item.Name || item.name}</Text>
        {lootDetails && (
          <Text style={styles.ammoText}>
            ({lootDetails.quantity}шт. {lootDetails.Name || lootDetails.name})
          </Text>
        )}
      </View>
    );
  };

  return (
    <ErrorBoundary>
      <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Выберите комплект снаряжения</Text>
            <ScrollView>
              {calculatedKits.map((kit) => (
                <View key={kit.name} style={styles.kitContainer}>
                  <TouchableOpacity onPress={() => toggleExpand(kit.name)}>
                    <Text style={styles.kitName}>{kit.name}</Text>
                  </TouchableOpacity>

                  {expandedKit === kit.name && (
                    <View style={styles.kitDetails}>
                      {kitCategories.map(({ key, title }) => (
                        kit[key] && (
                          <View key={key} style={styles.categoryContainer}>
                            <Text style={styles.categoryTitle}>{title}:</Text>
                            {kit[key].map((item, index) => {
                              if (item.resolved) {
                                return (
                                  <View key={index} style={styles.fixedItem}>
                                    <Text>{item.Name || item.name}: {item.quantity} шт.</Text>
                                  </View>
                                );
                              }
                              if (item?.type === 'choice') {
                                const selectedItems = selectedChoices[`${kit.name}-${key}-${index}`] || [];
                                const isMultiSelect = item.count > 1;

                                return (
                                  <View key={index} style={styles.choiceContainer}>
                                    {isMultiSelect && (
                                      <Text style={styles.choiceHeader}>
                                        Выберите {item.count} предмет{item.count > 1 ? 'а' : ''}:
                                      </Text>
                                    )}
                                    {item.options.map(opt => {
                                      const isGroup = !!opt.group;
                                      const groupKey = isGroup ? `group-${opt.group.map(i => i.name).join('+')}` : opt.name;
                                      const isSelected = Array.isArray(selectedItems)
                                        ? selectedItems.includes(groupKey)
                                        : selectedItems === groupKey;

                                      return (
                                        <TouchableOpacity
                                          key={groupKey}
                                          style={isMultiSelect ? styles.checkboxContainer : styles.radioContainer}
                                          onPress={() => handleSelectChoice(kit.name, key, index, opt, isMultiSelect)}
                                        >
                                          <View style={[
                                            isMultiSelect ? styles.checkbox : styles.radio,
                                            isSelected && (isMultiSelect ? styles.checkboxSelected : styles.radioSelected)
                                          ]}>
                                            {isMultiSelect && isSelected && <View style={{ width: 10, height: 10, backgroundColor: 'white', borderRadius: 2 }} />}
                                          </View>
                                          {isGroup
                                            ? <Text>{opt.group.map(i => i.Name || i.name).join(' + ')}</Text>
                                            : renderItemDetails(opt)
                                          }
                                        </TouchableOpacity>
                                      );
                                    })}
                                  </View>
                                );
                              }
                              if (item?.type === 'fixed') {
                                return (
                                  <View key={index} style={styles.fixedItem}>
                                    {renderItemDetails(item)}
                                  </View>
                                );
                              }
                              return null;
                            })}
                          </View>
                        )
                      ))}
                      {kit.resolvedLoot?.map((item, index) => item && (
                        <Text key={`loot-${index}`} style={styles.detailText}>- {item.quantity}шт. {item.Name || item.name}</Text>
                      ))}
                      <TouchableOpacity style={styles.selectButton} onPress={() => handleSelectKit(kit)}>
                        <Text style={styles.selectButtonText}>Выбрать</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  kitContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  kitName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#005A9C',
  },
  kitDetails: {
    marginTop: 10,
    paddingLeft: 15,
  },
  categoryContainer: {
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
  },
  fixedItem: {
    marginLeft: 10,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  choiceContainer: {
    marginVertical: 5,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 10,
  },
  radio: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#005A9C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: '#005A9C',
  },
  ammoText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginLeft: 5,
  },
  selectButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#C62828',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  choiceHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 10,
  },
  checkbox: {
    height: 22,
    width: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#005A9C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: '#005A9C',
  },
});

export default EquipmentKitModal;