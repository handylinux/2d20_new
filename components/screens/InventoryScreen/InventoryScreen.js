import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ImageBackground, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useCharacter } from '../../CharacterContext';
import { showAlert, showAlertWithButtons, showConfirm } from '../../../utils/alertUtils';
import AddWeaponModal from './modals/AddWeaponModal';
import CapsModal from './modals/CapsModal';
import SellItemModal from './modals/SellItemModal';
import AddItemModal from './modals/AddItemModal';
import WeaponModificationModal from './modals/WeaponModificationModal';
import allArmor from '../../../assets/Equipment/armor.json';
import allClothes from '../../../assets/Equipment/Clothes.json';
import allChems from '../../../assets/Equipment/chems.json';
import { calculateMaxHealth } from '../CharacterScreen/logic/characterLogic';
import allWeapons from '../../../assets/Equipment/weapons.json';

// --- ВАЖНО: поправьте путь, если utils у вас в другом месте ---
import { generateWeaponInstanceId } from './modals/weaponModificationUtils';
import { convertWeaponIdToDisplayName } from './modals/weaponNameUtils';
import { ORIGINS } from '../CharacterScreen/logic/originsData';

// Функция для определения экипируемости предмета
const isEquippableItem = (item) => {
  const itemType = item.itemType;
  // Только оружие, броня, одежда могут быть экипированы
  return itemType === 'weapon' || itemType === 'armor' || itemType === 'clothing' || itemType === 'outfit';
};

// Функция для определения типа химиката
const isChemItem = (item) => {
  return item.itemType === 'chem' || 
         (item.effects && Object.keys(item.effects).length > 0) || 
         (item.healAmount !== undefined);
};

// Функция для определения типа оружия
const isWeaponItem = (item) => {
  return item.itemType === 'weapon' ||
         (item.weaponId !== undefined) ||
         (item.damage !== undefined);
};

// Функция для определения типа брони/одежды/обмундирования
const isArmorItem = (item) => {
  return item.itemType === 'armor' ||
         item.itemType === 'clothing' ||
         item.itemType === 'outfit';
};

// Функция для определения типа еды/напитков
const isFoodItem = (item) => {
  return item.itemType === 'food' ||
         item.itemType === 'drink' ||
         (item.foodValue !== undefined) ||
         (item.healAmount !== undefined && item.itemType !== 'chem');
};

// Функция для определения типа препаратов (расширенная)
const isChemItemExtended = (item) => {
  return item.itemType === 'chem' ||
         (item.effects && Object.keys(item.effects).length > 0);
};

// Функция для определения типа брони для роботов
const isRobotArmorItem = (item) => {
  return item.itemType === 'robot_armor' ||
         (item.name && item.name.toLowerCase().includes('робот')) ||
         (item.Name && item.Name.toLowerCase().includes('робот'));
};

// Функция для проверки, является ли текущее происхождение роботом
const isRobotOrigin = (origin) => {
  if (!origin) return false;
  const originData = ORIGINS.find(o => o.id === origin.id);
  return originData && originData.special === 'robot';
};

// Функции для проверки ограничений по типам предметов
const canEquipWeapon = (origin) => true; // Все могут использовать оружие

const canEquipArmor = (origin) => !isRobotOrigin(origin); // Все кроме роботов могут носить броню/одежду

const canUseConsumables = (origin) => !isRobotOrigin(origin); // Все кроме роботов могут употреблять еду/препараты

const canEquipRobotArmor = (origin) => isRobotOrigin(origin); // Только роботы могут носить броню для роботов

const CapsSection = ({ caps, onAdd, onSubtract }) => (
  <View style={styles.capsContainer}>
    <Text style={styles.capsLabel}>Крышки</Text>
    <TouchableOpacity style={styles.capsButton} onPress={onSubtract}>
      <Text style={styles.capsButtonText}>↓ Списать</Text>
    </TouchableOpacity>
    <Text style={styles.capsValue}>{caps}</Text>
    <TouchableOpacity style={styles.capsButton} onPress={onAdd}>
      <Text style={styles.capsButtonText}>↑ Внести</Text>
    </TouchableOpacity>
  </View>
);

const InventoryScreen = () => {
  const {
    equipment, setEquipment,
    equippedWeapons, setEquippedWeapons,
    equippedArmor, setEquippedArmor,
    caps, setCaps,
    attributes, level,
    currentHealth, setCurrentHealth,
    saveModifiedItem,
    getModifiedItem,
    origin,
    handleEquipWeapon,
    handleUnequipWeapon,
    adjustItemQuantity
  } = useCharacter();
  
  const [isAddWeaponModalVisible, setIsAddWeaponModalVisible] = useState(false);
  const [isCapsModalVisible, setIsCapsModalVisible] = useState(false);
  const [capsOperationType, setCapsOperationType] = useState('add');
  const [isSellModalVisible, setIsSellModalVisible] = useState(false);
  const [selectedItemForSale, setSelectedItemForSale] = useState(null);
  const [isAddItemModalVisible, setAddItemModalVisible] = useState(false);
  const [isModificationModalVisible, setIsModificationModalVisible] = useState(false);
  const [selectedWeaponForModification, setSelectedWeaponForModification] = useState(null);

  const handleOpenCapsModal = (type) => {
    setCapsOperationType(type);
    setIsCapsModalVisible(true);
  };

  const handleSaveCaps = (amount) => {
    if (capsOperationType === 'add') {
      setCaps(prev => prev + amount);
    } else {
      setCaps(prev => Math.max(0, prev - amount));
    }
  };

  const handleOpenModificationModal = (weapon) => {
    if (!isWeaponItem(weapon)) {
      showAlert("Ошибка", "Модифицировать можно только оружие, идиот.");
      return;
    }
    setSelectedWeaponForModification(weapon);
    setIsModificationModalVisible(true);
  };

  const handleApplyModification = (modifiedWeapon) => {
    saveModifiedItem(selectedWeaponForModification, modifiedWeapon);
    
    setEquipment(prev => {
      const newItems = prev?.items ? [...prev.items] : [];
      const keyToMatch = selectedWeaponForModification.instanceId || 
                        selectedWeaponForModification.uniqueId || 
                        selectedWeaponForModification.Name || 
                        selectedWeaponForModification.Название || 
                        selectedWeaponForModification.name;
      
      const idx = newItems.findIndex(i =>
        (i.instanceId && keyToMatch && i.instanceId === keyToMatch) ||
        (i.uniqueId && keyToMatch && i.uniqueId === keyToMatch) ||
        ((i.Name || i.Название || i.name) === (selectedWeaponForModification.Name || selectedWeaponForModification.Название || selectedWeaponForModification.name))
      );
      
      if (idx !== -1) {
        const qty = newItems[idx].quantity || 1;
        const newItem = {
          ...modifiedWeapon,
          itemType: 'weapon',
          instanceId: modifiedWeapon.instanceId || generateWeaponInstanceId(modifiedWeapon.weaponId || modifiedWeapon.id || modifiedWeapon.code, modifiedWeapon.appliedModIds || []),
          quantity: qty
        };
        newItems[idx] = newItem;
      } else {
        const newItem = {
          ...modifiedWeapon,
          itemType: 'weapon',
          instanceId: modifiedWeapon.instanceId || generateWeaponInstanceId(modifiedWeapon.weaponId || modifiedWeapon.id || modifiedWeapon.code, modifiedWeapon.appliedModIds || []),
          quantity: modifiedWeapon.quantity || 1
        };
        newItems.push(newItem);
      }
      return { ...(prev || {}), items: newItems };
    });
    
    setIsModificationModalVisible(false);
    setSelectedWeaponForModification(null);
  };

  const handleApplyChem = (item) => {
    if (!isChemItem(item)) {
      showAlert("Ошибка", "Это не препарат.");
      return;
    }

    if (!canUseConsumables(origin)) {
      showAlert("Ошибка", "Этот персонаж не может использовать препараты.");
      return;
    }

    if (!item.itemType) {
      item = { ...item, itemType: 'chem' };
    }
    
    showAlertWithButtons(
      "Применение химиката",
      `Вы хотите применить ${item.Name || item.Название || item.name} на себя или другого персонажа?`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "На себя",
          onPress: () => {
            if (item.healAmount) {
              const maxHealth = calculateMaxHealth(attributes, level);
              const healAmount = item.healAmount;
              const newHealth = Math.min(maxHealth, currentHealth + healAmount);
              setCurrentHealth(newHealth);
              showAlert("Успешно", `Восстановлено ${healAmount} единиц здоровья.`);
            } else {
              showAlert("Применено", `${item.Name || item.Название || item.name} применен на вас.`);
            }
            handleRemoveItem(item, 1);
          }
        },
        {
          text: "На другого",
          onPress: () => {
            showAlert("Применено", `${item.Name || item.Название || item.name} применен на другого персонажа.`);
            handleRemoveItem(item, 1);
          }
        }
      ]
    );
  };
  
  const handleRemoveItem = (itemToRemove, quantity) => {
    adjustItemQuantity(itemToRemove, -quantity);
  };

  const handleSellItem = (item) => {
    setSelectedItemForSale(item);
    setIsSellModalVisible(true);
  };

  const handleConfirmSale = (quantity, finalPrice) => {
    setCaps(prev => prev + finalPrice);
    handleRemoveItem(selectedItemForSale, quantity);
    setIsSellModalVisible(false);
    setSelectedItemForSale(null);
  };
    
  const handleAddItem = (item) => {
    adjustItemQuantity(item, 1);
  };

  const getSlotsForArea = (area) => {
    const slots = [];
    if (!area) {
      console.log(`[DEBUG] No area specified for item`);
      return slots;
    }

    console.log(`[DEBUG] getSlotsForArea called with area: "${area}"`);

    if (area.includes('Голова')) slots.push('head');
    if (area.includes('Тело')) slots.push('body');
    if (area.includes('Руки') || area.includes('Рука')) {
        slots.push('leftArm', 'rightArm');
    }
    if (area.includes('Ноги') || area.includes('Нога')) {
        slots.push('leftLeg', 'rightLeg');
    }

    console.log(`[DEBUG] Slots determined:`, slots);
    return slots;
  };

  // Функция для получения правильного поля области из предмета
  const getItemArea = (item) => {
    return item.area || item.protected_area || item.protectedArea;
  };

  // ← ИСПРАВЛЕННАЯ ФУНКЦИЯ: Только ручная экипировка
  const handleEquipItem = (item) => {
    console.log(`[DEBUG] handleEquipItem called with:`, {
      item: item.Name || item.name,
      itemType: item.itemType,
      area: item.area,
      origin: origin?.name,
      isRobot: isRobotOrigin(origin),
      equippedWeapons: equippedWeapons.map((w, i) => w ? `${w.Name || w.name} (slot ${i})` : null).filter(Boolean),
      equippedArmor: equippedArmor
    });

    if (!isEquippableItem(item)) {
      console.log(`[DEBUG] Item is not equippable:`, { itemType: item.itemType });
      showAlert("Ошибка", "Этот предмет нельзя экипировать.");
      return;
    }

    if (isArmorItem(item) && !canEquipArmor(origin)) {
      console.log(`[DEBUG] Character cannot equip armor/clothing, blocked`);
      showAlert("Ошибка", "Этот персонаж не может носить данную экипировку.");
      return;
    }

    // ← ЗАКОММЕНТИРОВАНО: Логика для брони роботов (пока не используется)
    /*
    if (isRobotArmorItem(item) && !canEquipRobotArmor(origin)) {
      console.log(`[DEBUG] Non-robot trying to equip robot armor, blocked`);
      showAlert("Ошибка", "Эту броню могут носить только роботы.");
      return;
    }
    */

    if (item.itemType === 'weapon') {
      const equippedWeaponsCount = equippedWeapons.filter(w => w !== null).length;
      
      if (equippedWeaponsCount >= 2) {
        // Показываем выбор слота для замены
        showAlertWithButtons(
          "Слоты оружия заняты",
          "Выберите слот для замены оружия:",
          [
            { text: "Отмена", style: "cancel" },
            {
              text: "Слот 1",
              onPress: () => {
                handleEquipWeapon(item, 0); // forceSlotIndex = 0
              }
            },
            {
              text: "Слот 2", 
              onPress: () => {
                handleEquipWeapon(item, 1); // forceSlotIndex = 1
              }
            }
          ]
        );
      } else {
        // Экипируем в свободный слот
        handleEquipWeapon(item);
      }
    } else {
      // Логика для брони/одежды
      const itemArea = getItemArea(item);
      console.log(`[DEBUG] Unequip - Item area determined:`, { area: itemArea, item: item.Name || item.name });
      const slots = getSlotsForArea(itemArea);
      if (slots.length === 0) {
        console.log(`[DEBUG] Unequip - No slots found for area: "${itemArea}"`);
        showAlert("Ошибка", "Неизвестная область экипировки.");
        return;
      }

      let equippedCount = 0;
      slots.forEach(slot => {
        if (equippedArmor[slot].armor || equippedArmor[slot].clothing) {
          equippedCount++;
        }
      });

      if (equippedCount >= slots.length) {
        showAlert("Ошибка", "Все слоты для этой области заняты.");
        return;
      }

      // Экипируем в первый свободный слот
      console.log(`[DEBUG] Attempting to equip armor/clothing:`, {
        item: item.Name || item.name,
        itemType: item.itemType,
        area: item.area,
        slots: slots,
        currentArmorState: equippedArmor
      });

      for (let slot of slots) {
        const slotData = equippedArmor[slot];
        console.log(`[DEBUG] Checking slot ${slot}:`, {
          hasArmor: !!slotData.armor,
          hasClothing: !!slotData.clothing,
          armorItem: slotData.armor?.Name || slotData.armor?.name,
          clothingItem: slotData.clothing?.Name || slotData.clothing?.name
        });

        if (!slotData.armor && !slotData.clothing) {
          console.log(`[DEBUG] Found free slot ${slot}, equipping...`);
          if (item.itemType === 'armor') {
            setEquippedArmor(prev => ({
              ...prev,
              [slot]: { ...prev[slot], armor: item }
            }));
          } else {
            setEquippedArmor(prev => ({
              ...prev,
              [slot]: { ...prev[slot], clothing: item }
            }));
          }

          // Уменьшаем количество в инвентаре
          adjustItemQuantity(item, -1);
          showAlert("Экипировано", `${item.Name || item.name} надет`);
          return;
        }
      }
    }
  };

  // ← ИСПРАВЛЕННАЯ ФУНКЦИЯ СНЯТИЯ
  const handleUnequipItem = (item) => {
    if (item.itemType === 'weapon') {
      // Найти слот, где экипировано это оружие
      const slotIndex = equippedWeapons.findIndex(w => 
        w && (
          (w.instanceId === item.instanceId) ||
          (w.uniqueId === item.uniqueId) ||
          (w.Name === item.Name && w.Название === item.Название)
        )
      );
      
      if (slotIndex !== -1) {
        const equippedWeapon = equippedWeapons[slotIndex];
        if (equippedWeapon) {
          handleUnequipWeapon(equippedWeapon, slotIndex);
          showAlert("Снято", `${item.Name || item.name} снят`);
        }
      }
    } else {
      // Логика для брони/одежды
      const itemArea = getItemArea(item);
      console.log(`[DEBUG] Item area determined:`, { area: itemArea, item: item.Name || item.name });
      const slots = getSlotsForArea(itemArea);
      if (slots.length === 0) {
        console.log(`[DEBUG] No slots found for area: "${itemArea}"`);
        showAlert("Ошибка", "Неизвестная область экипировки.");
        return;
      }

      console.log(`[DEBUG] Attempting to unequip armor/clothing:`, {
        item: item.Name || item.name,
        itemType: item.itemType,
        area: item.area,
        slots: slots,
        currentArmorState: equippedArmor
      });

      for (let slot of slots) {
        const slotData = equippedArmor[slot];
        console.log(`[DEBUG] Checking slot ${slot} for unequip:`, {
          itemInArmor: slotData.armor?.Name || slotData.armor?.name,
          itemInClothing: slotData.clothing?.Name || slotData.clothing?.name,
          targetItem: item.Name || item.name
        });

        if (slotData.armor === item || slotData.clothing === item) {
          console.log(`[DEBUG] Found item in slot ${slot}, unequipping...`);
          if (slotData.armor === item) {
            setEquippedArmor(prev => ({
              ...prev,
              [slot]: { ...prev[slot], armor: null }
            }));
          } else {
            setEquippedArmor(prev => ({
              ...prev,
              [slot]: { ...prev[slot], clothing: null }
            }));
          }

          // Добавляем обратно в инвентарь
          adjustItemQuantity(item, 1);
          showAlert("Снято", `${item.Name || item.name} снят`);
          return;
        }
      }
    }
  };

  // Подготовка данных для отображения
  const displayItems = useMemo(() => {
    const items = equipment?.items || [];
    return items.map(item => {
      const modifiedItem = getModifiedItem(item);
      const displayItem = modifiedItem || item;

      // ← ИСПРАВЛЕНИЕ: Проверяем, экипирован ли предмет
      const isEquipped = equippedWeapons.some((w, index) => {
        const isMatch = w && (
          (w.instanceId === item.instanceId) ||
          (w.uniqueId === item.uniqueId) ||
          (w.Name === item.Name && w.Название === item.Название)
        );
        if (isMatch) {
          console.log(`[DEBUG] Weapon equipped found:`, {
            weapon: w.Name || w.name,
            item: item.Name || item.name,
            slot: index
          });
        }
        return isMatch;
      }) || Object.values(equippedArmor).some(slotData => {
        const isArmorMatch = slotData.armor === item;
        const isClothingMatch = slotData.clothing === item;
        if (isArmorMatch || isClothingMatch) {
          console.log(`[DEBUG] Armor/Clothing equipped found:`, {
            item: item.Name || item.name,
            type: isArmorMatch ? 'armor' : 'clothing',
            slot: Object.keys(equippedArmor).find(key => equippedArmor[key] === slotData)
          });
        }
        return isArmorMatch || isClothingMatch;
      });

      let equippedType = null;
      let equippedSlot = null;

      // Определяем тип экипировки и слот
      equippedWeapons.forEach((w, index) => {
        if (w === item || 
            (w && item && (
              (w.instanceId === item.instanceId) ||
              (w.uniqueId === item.uniqueId) ||
              (w.Name === item.Name && w.Название === item.Название)
            ))) {
          equippedType = 'weapon';
          equippedSlot = index;
        }
      });

      if (!equippedType) {
        Object.entries(equippedArmor).forEach(([slotName, slotData]) => {
          if (slotData.armor === item) {
            equippedType = 'armor';
            equippedSlot = slotName;
          } else if (slotData.clothing === item) {
            equippedType = 'clothing';
            equippedSlot = slotName;
          }
        });
      }

      return {
        ...displayItem,
        isEquipped,
        equippedType,
        equippedSlot,
        originalItem: item // Сохраняем ссылку на оригинальный предмет для операций
      };
    });
  }, [equipment, equippedWeapons, equippedArmor, getModifiedItem]);

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>Предмет</Text>
      </View>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>Действия</Text>
      </View>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>Характеристики</Text>
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const isWeapon = isWeaponItem(item);
    const isArmor = isArmorItem(item);
    const isChem = isChemItem(item); // Используем оригинальную функцию
    const isFood = isFoodItem(item);
    const isRobotArmor = isRobotArmorItem(item);
    const equippable = isEquippableItem(item);
    const isRobot = isRobotOrigin(origin);

    // Проверки ограничений по типам
    const canUseThisWeapon = canEquipWeapon(origin);
    const canUseThisArmor = canEquipArmor(origin);
    const canUseConsumables = canUseConsumables(origin);
    const canUseRobotArmor = canEquipRobotArmor(origin); // Пока закомментировано

    // ← ОТЛАДОЧНЫЕ ЛОГИ ДЛЯ ДИАГНОСТИКИ
    if (isWeapon || isArmor || isChem || isFood || isRobotArmor) {
      console.log('[InventoryScreen] Debug item restrictions:', {
        item: item.Name || item.name,
        itemType: item.itemType,
        isWeapon,
        isArmor,
        isChem,
        isFood,
        isRobotArmor,
        isRobot,
        canUseThisWeapon,
        canUseThisArmor,
        canUseConsumables,
        canUseRobotArmor,
        shouldShowEquipButton: (isWeapon && canUseThisWeapon) || (isArmor && canUseThisArmor),
        shouldShowApplyButton: ((isChem || isFood) && canUseConsumables)
      });
    }

    const weight = parseFloat(String(item.Weight !== undefined ? item.Weight : item.Вес !== undefined ? item.Вес : item.weight).replace(',', '.')) || 0;
    const price = parseFloat(item.Cost !== undefined ? item.Cost : item.Цена !== undefined ? item.Цена : item.price) || 0;

    const displayName = item.Name || item.Название || item.name;
    const displayNameWithMods = isWeapon && item.appliedModIds && item.appliedModIds.length > 0 
      ? `${displayName} ⚙️` 
      : displayName;

    const handleActionPress = () => {
      if (item.isEquipped) {
        handleUnequipItem(item.originalItem || item);
      } else {
        handleEquipItem(item.originalItem || item); // ← ТОЛЬКО РУЧНАЯ ЭКИПИРОВКА
      }
    };

    return (
      <View style={styles.tableRow}>
        <View style={styles.mainRowContent}>
          <View style={styles.itemNameContainer}>
            <Text style={[
              styles.itemNameText, 
              item.isEquipped && styles.equippedItemText
            ]}>
              {displayNameWithMods}
              {item.isEquipped && (
                <Text style={styles.equippedSlotText}>
                  {' '}({item.equippedType === 'weapon' ? `Слот ${item.equippedSlot + 1}` :
                         item.equippedType === 'armor' ? `Броня: ${item.equippedSlot}` :
                         item.equippedType === 'clothing' ? `Одежда: ${item.equippedSlot}` : 'Экипировано'})
                </Text>
              )}
            </Text>
          </View>
        </View>
        <View style={styles.actionContainer}>
          {/* Кнопка экипировки/снятия для оружия - доступно всем */}
          {isWeapon && (
              <TouchableOpacity
                  style={[styles.actionButton, item.isEquipped ? styles.unequipButton : {}]}
                  onPress={handleActionPress}>
                  <Text style={styles.actionButtonText}>{item.isEquipped ? '↓ Снять' : '↑ Надеть'}</Text>
              </TouchableOpacity>
          )}

          {/* Кнопка экипировки/снятия для брони/одежды - недоступно роботам */}
          {isArmor && canUseThisArmor && (
              <TouchableOpacity
                  style={[styles.actionButton, item.isEquipped ? styles.unequipButton : {}]}
                  onPress={handleActionPress}>
                  <Text style={styles.actionButtonText}>{item.isEquipped ? '↓ Снять' : '↑ Надеть'}</Text>
              </TouchableOpacity>
          )}

          {/* Кнопка применения для препаратов - недоступно роботам */}
          {isChem && canUseConsumables && !item.isEquipped && (
              <TouchableOpacity
                  style={[styles.actionButton, styles.applyButton]}
                  onPress={() => handleApplyChem(item.originalItem || item)}>
                  <Text style={styles.actionButtonText}>Применить</Text>
              </TouchableOpacity>
          )}

          {/* Кнопка применения для еды/напитков - недоступно роботам */}
          {isFood && canUseConsumables && !item.isEquipped && (
              <TouchableOpacity
                  style={[styles.actionButton, styles.applyButton]}
                  onPress={() => handleApplyChem(item.originalItem || item)}>
                  <Text style={styles.actionButtonText}>Употребить</Text>
              </TouchableOpacity>
          )}

          {/* ЗАКОММЕНТИРОВАНО: Кнопка для брони роботов - пока не используется */}
          {/*
          {isRobotArmor && canUseRobotArmor && (
              <TouchableOpacity
                  style={[styles.actionButton, item.isEquipped ? styles.unequipButton : {}]}
                  onPress={handleActionPress}>
                  <Text style={styles.actionButtonText}>{item.isEquipped ? '↓ Снять' : '↑ Надеть'}</Text>
              </TouchableOpacity>
          )}
          */}

          {/* Кнопка модификации только для оружия */}
          {isWeapon && !item.isEquipped && (
              <TouchableOpacity
                  style={[styles.actionButton, styles.modifyButton]}
                  onPress={() => handleOpenModificationModal(item.originalItem || item)}>
                  <Text style={styles.actionButtonText}>Модиф.</Text>
              </TouchableOpacity>
          )}

          {/* Кнопка продажи для всех НЕ экипированных предметов */}
          {!item.isEquipped && (
              <TouchableOpacity style={[styles.actionButton, styles.sellButton]} onPress={() => handleSellItem(item.originalItem || item)}>
                  <Text style={styles.actionButtonText}>Продать</Text>
              </TouchableOpacity>
          )}
        </View>
        <View style={styles.itemSubRow}>
          <Text style={styles.itemSubText}>Кол-во: {item.quantity || 1} шт.</Text>
          <Text style={styles.itemSubText}>Цена: {price * (item.quantity || 1)}</Text>
          <Text style={styles.itemSubText}>Вес: {Number((weight * (item.quantity || 1)).toFixed(3))}</Text>
          {item.isEquipped && (
            <Text style={[styles.itemSubText, styles.equippedSlotIndicator]}>
              Экипировано
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderFooter = () => (
    <TouchableOpacity style={styles.addButtonRow} onPress={() => setAddItemModalVisible(true)}>
      <Text style={styles.addButtonText}>+</Text>
    </TouchableOpacity>
  );

  const totalWeight = useMemo(() => {
    let total = 0;
    if (equipment?.items) {
      total += equipment.items.reduce((acc, item) => {
        const itemWithType = { ...item, itemType: item.itemType || 'weapon' };
        const modifiedItem = getModifiedItem(itemWithType);
        const displayItem = modifiedItem || item;
        const weight = parseFloat(String(displayItem.Weight !== undefined ? displayItem.Weight : displayItem.Вес !== undefined ? displayItem.Вес : displayItem.weight).replace(',', '.')) || 0;
        return acc + (weight * item.quantity);
      }, 0);
    }
    equippedWeapons.forEach(weapon => {
      if (weapon) {
        const weaponWithType = { ...weapon, itemType: weapon.itemType || 'weapon' };
        const modifiedWeapon = getModifiedItem(weaponWithType);
        const displayWeapon = modifiedWeapon || weapon;
        const weight = parseFloat(String(displayWeapon.Weight !== undefined ? displayWeapon.Weight : displayWeapon.Вес !== undefined ? displayWeapon.Вес : displayWeapon.weight).replace(',', '.')) || 0;
        total += weight;
      }
    });
    Object.values(equippedArmor).forEach(slotData => {
      if (slotData.armor) {
        const weight = parseFloat(String(slotData.armor.Weight !== undefined ? slotData.armor.Weight : slotData.armor.Вес !== undefined ? slotData.armor.Вес : slotData.armor.weight).replace(',', '.')) || 0;
        total += weight;
      }
      if (slotData.clothing) {
        const weight = parseFloat(String(slotData.clothing.Weight !== undefined ? slotData.clothing.Weight : slotData.clothing.Вес !== undefined ? slotData.clothing.Вес : slotData.clothing.weight).replace(',', '.')) || 0;
        total += weight;
      }
    });
    return Number(total.toFixed(3));
  }, [equipment, equippedWeapons, equippedArmor, getModifiedItem]);
  
  const totalPrice = useMemo(() => {
    let total = 0;
    if (equipment?.items) {
      total += equipment.items.reduce((acc, item) => {
        const itemWithType = { ...item, itemType: item.itemType || 'weapon' };
        const modifiedItem = getModifiedItem(itemWithType);
        const displayItem = modifiedItem || item;
        const price = parseFloat(displayItem.Cost !== undefined ? displayItem.Cost : displayItem.Цена !== undefined ? displayItem.Цена : displayItem.price) || 0;
        return acc + (price * item.quantity);
      }, 0);
    }
    equippedWeapons.forEach(weapon => {
      if (weapon) {
        const weaponWithType = { ...weapon, itemType: weapon.itemType || 'weapon' };
        const modifiedWeapon = getModifiedItem(weaponWithType);
        const displayWeapon = modifiedWeapon || weapon;
        const price = parseFloat(displayWeapon.Cost !== undefined ? displayWeapon.Cost : displayWeapon.Цена !== undefined ? displayWeapon.Цена : displayWeapon.price) || 0;
        total += price;
      }
    });
    Object.values(equippedArmor).forEach(slotData => {
      if (slotData.armor) {
        const price = parseFloat(slotData.armor.Cost !== undefined ? slotData.armor.Cost : slotData.armor.Цена !== undefined ? slotData.armor.Цена : slotData.armor.price) || 0;
        total += price;
      }
      if (slotData.clothing) {
        const price = parseFloat(slotData.clothing.Cost !== undefined ? slotData.clothing.Cost : slotData.clothing.Цена !== undefined ? slotData.clothing.Цена : slotData.clothing.price) || 0;
        total += price;
      }
    });
    return total;
  }, [equipment, equippedWeapons, equippedArmor, getModifiedItem]);

  return (
    <ImageBackground
      source={require('../../../assets/bg.png')}
      style={styles.background}
      imageStyle={{ opacity: 0.3 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <CapsSection 
            caps={caps}
            onAdd={() => handleOpenCapsModal('add')}
            onSubtract={() => handleOpenCapsModal('subtract')}
          />
          <View style={styles.tableContainer}>
            {renderTableHeader()}
            <FlatList
              data={displayItems}
              renderItem={renderItem}
              keyExtractor={(item, index) => item.instanceId || item.uniqueId || `${item.Name || item.Название || item.name}-${index}`}
              style={styles.list}
              ListEmptyComponent={<Text style={styles.emptyListText}>Инвентарь пуст</Text>}
              ListFooterComponent={renderFooter}
            />
          </View>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>Общий вес: {totalWeight}</Text>
            <Text style={styles.summaryText}>Общая цена: {totalPrice}</Text>
          </View>
        </View>
        <AddWeaponModal
          visible={isAddWeaponModalVisible}
          onClose={() => setIsAddWeaponModalVisible(false)}
          weapons={[
            ...allWeapons,
            ...allClothes.clothes.flatMap(category => category.items),
            ...allArmor.armor.flatMap(category => category.items),
            ...allChems
          ]}
          onSelectWeapon={handleAddItem}
        />
        <CapsModal
          visible={isCapsModalVisible}
          onClose={() => setIsCapsModalVisible(false)}
          onSave={handleSaveCaps}
          operationType={capsOperationType}
        />
        <SellItemModal
            visible={isSellModalVisible}
            onClose={() => setIsSellModalVisible(false)}
            item={selectedItemForSale}
            onConfirmSale={handleConfirmSale}
        />
        <AddItemModal
          visible={isAddItemModalVisible}
          onClose={() => setAddItemModalVisible(false)}
          onSelectItem={handleAddItem}
        />
        <WeaponModificationModal
          visible={isModificationModalVisible}
          onClose={() => setIsModificationModalVisible(false)}
          weapon={selectedWeaponForModification}
          onApplyModification={handleApplyModification}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

// Стили остаются те же
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: 'transparent' 
  },
  background: { 
    flex: 1,
    width: '100%',
    height: '100%'
  },
  container: {
    flex: 1,
    padding: 16,
  },
  capsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 16,
  },
  capsLabel: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  capsButton: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  capsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  capsValue: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'center',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerCell: {
    flex: 1,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'column', 
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#fff',
    borderStyle: 'dashed',
  },
  mainRowContent: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, 
  },
  itemNameContainer: { 
    flex: 0.7,
  },
  itemNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flexWrap: 'wrap', 
  },
  equippedItemText: {
      fontStyle: 'italic',
      fontWeight: 'bold',
      color: '#005a9c',
  },
  equippedSlotText: {
      fontSize: 12,
      color: '#666',
      fontStyle: 'normal',
      fontWeight: 'normal',
  },
  equippedSlotIndicator: {
      color: '#28a745',
      fontWeight: 'bold',
  },
  itemSubRow: { 
    flexDirection: 'row',
  },
  itemSubText: {
    fontSize: 12,
    color: '#666',
    marginRight: 15, 
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 8,
    marginBottom: 4,
  },
  sellButton: {
    backgroundColor: '#DC3545',
  },
  applyButton: {
    backgroundColor: '#28a745',
  },
  unequipButton: {
      backgroundColor: '#ffc107',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  summaryContainer: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginTop: 10,
    borderRadius: 5,
  },
  summaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#000',
  },
  addButtonRow: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  }
});

export default InventoryScreen;