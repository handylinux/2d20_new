import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import {
  getAvailableModificationsForWeapon,
  groupModificationsBySlot,
  applyMultipleModifications,
  getModificationDataById,
  isModificationCompatible,
  getConflictingModifications,
  generateWeaponInstanceId
} from './weaponModificationUtils';
import { showAlert } from '../../../../utils/alertUtils';

// Компонент для сворачиваемой секции
const CollapsibleSection = ({ title, children, isExpanded, onToggle }) => {
  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity onPress={onToggle} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );
};

const WeaponModificationModal = ({ 
  visible, 
  onClose, 
  weapon, 
  onApplyModification,
  inventory,
  setInventory 
}) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedModifications, setSelectedModifications] = useState({});
  const [modifiedWeapon, setModifiedWeapon] = useState(null);
  const [displayName, setDisplayName] = useState('');

  // Инициализация при открытии модального окна
  useEffect(() => {
    if (visible && weapon) {
      // Устанавливаем уже примененные модификации
      const appliedMods = {};
      if (weapon.appliedModIds) {
        weapon.appliedModIds.forEach(modId => {
          const mod = getModificationDataById(modId);
          if (mod) {
            appliedMods[mod.Slot] = modId;
          }
        });
      }
      setSelectedModifications(appliedMods);
      
      // Обновляем отображение
      updateWeaponDisplay(weapon, appliedMods);
      
      // Сбрасываем раскрытые секции
      setExpandedSections({});
    }
  }, [visible, weapon]);

  // ДИНАМИЧЕСКАЯ ГЕНЕРАЦИЯ НАЗВАНИЯ ПО ТЕКУЩИМ МОДАМ
  const updateWeaponDisplay = useCallback((baseWeapon, modIds) => {
    const modIdArray = Object.values(modIds);
    
    // Применяем модификации к характеристикам
    let weaponStats;
    if (modIdArray.length > 0) {
      weaponStats = applyMultipleModifications(baseWeapon, modIdArray);
    } else {
      weaponStats = { ...baseWeapon };
    }
    
    // ИСПРАВЛЕНИЕ: Используем истинное исходное название без префиксов
    const trueBaseName = baseWeapon.trueOriginalName || 
                         baseWeapon.originalName || 
                         baseWeapon.Название || 
                         baseWeapon.name || 
                         'Неизвестное оружие';
    
    const prefixes = new Set();
    
    modIdArray.forEach(modId => {
      const mod = getModificationDataById(modId);
      if (mod) {
        const prefix = mod.Prefix || mod.prefix;
        if (prefix && prefix !== trueBaseName) {
          prefixes.add(prefix);
        }
      }
    });
    
    let finalName = trueBaseName;
    if (prefixes.size > 0) {
      finalName = `${Array.from(prefixes).join(' ')} ${trueBaseName}`;
    }
    
    setModifiedWeapon(weaponStats);
    setDisplayName(finalName);
  }, []);

  // Переключение секции
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Выбор модификации
  const selectModification = (modId, slot) => {
    const modification = getModificationDataById(modId);
    if (!modification) return;

    const newSelectedMods = { ...selectedModifications };
    
    // Проверяем конфликты
    const conflicts = getConflictingModifications(modId, Object.values(newSelectedMods));
    if (conflicts.length > 0 && newSelectedMods[slot] !== modId) {
      showAlert(
        'Конфликт модификаций',
        `Эта модификация конфликтует с уже установленными в слоте ${slot}.`
      );
      return;
    }
    
    if (newSelectedMods[slot] === modId) {
      // Снимаем модификацию
      delete newSelectedMods[slot];
    } else {
      // Устанавливаем новую модификацию
      newSelectedMods[slot] = modId;
    }
    
    setSelectedModifications(newSelectedMods);
    
    // Обновляем отображение
    updateWeaponDisplay(weapon, newSelectedMods);
  };

  // Применение модификаций - СОХРАНЯЕМ ТОЛЬКО appliedModIds
  const applyModifications = () => {
    if (!modifiedWeapon) return;
    
    const uniqueId = generateWeaponInstanceId(
      weapon.weaponId || weapon.id,
      Object.values(selectedModifications)
    );
    
    const finalWeapon = {
      ...modifiedWeapon,
      appliedModIds: Object.values(selectedModifications), // ← ТОЛЬКО ЭТО
      uniqueId,
      itemType: 'weapon'
      // Убираем все поля для названий - они больше не нужны
    };
    
    onApplyModification(finalWeapon);
    onClose();
  };

  // Сброс модификаций
  const resetModifications = () => {
    setSelectedModifications({});
    setModifiedWeapon({ ...weapon });
    const trueOriginalName = weapon.trueOriginalName || weapon.originalName || weapon.Название || weapon.name;
    setDisplayName(trueOriginalName);
    setExpandedSections({});
  };

  // Получение текущей модификации в слоте
  const getCurrentModInSlot = (slot) => {
    const modId = selectedModifications[slot];
    return modId ? getModificationDataById(modId) : null;
  };

  // Обработка закрытия
  const handleClose = () => {
    setSelectedModifications({});
    setExpandedSections({});
    setModifiedWeapon({ ...weapon });
    const trueOriginalName = weapon.trueOriginalName || weapon.originalName || weapon.Название || weapon.name;
    setDisplayName(trueOriginalName);
    onClose();
  };

  if (!weapon) return null;

  const availableMods = getAvailableModificationsForWeapon(weapon.id || weapon.weaponId);
  const groupedMods = groupModificationsBySlot(availableMods);

  const slotOrder = [
    'Receivers', 'Capacitors', 'Barrels', 'Magazines', 
    'Grips', 'Stocks', 'Sights', 'Muzzles', 'Fuels', 
    'Dishes', 'Tanks', 'Nozzles', 'Uniques'
  ];

  const getSlotDisplayName = (slot, currentMod) => {
    const slotNames = {
      'Grips': 'Рукоять',
      'Stocks': 'Ложе',
      'Receivers': 'Ресивер',
      'Barrels': 'Ствол',
      'Magazines': 'Магазин',
      'Sights': 'Прицел',
      'Muzzles': 'Дульное устройство'
    };
    
    const displaySlot = slotNames[slot] || slot;
    return currentMod ? `${displaySlot} (${currentMod.Name})` : `${displaySlot}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Модификация: {weapon.Название || weapon.name}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.modificationsSection}>
              <Text style={styles.sectionTitle}>Доступные модификации:</Text>
              
              {slotOrder.map(slot => {
                const mods = groupedMods[slot];
                if (!mods || mods.length === 0) return null;

                const currentMod = getCurrentModInSlot(slot);
                const slotDisplay = getSlotDisplayName(slot, currentMod);
                
                return (
                  <CollapsibleSection
                    key={slot}
                    title={`${slotDisplay} (${mods.length})`}
                    isExpanded={expandedSections[slot]}
                    onToggle={() => toggleSection(slot)}
                  >
                    {mods.map(mod => {
                      const isSelected = selectedModifications[slot] === mod.id;
                      const isCompatible = isModificationCompatible(weapon.id || weapon.weaponId, mod.id);
                      
                      return (
                        <TouchableOpacity
                          key={mod.id}
                          style={[
                            styles.modificationItem,
                            isSelected && styles.selectedModification,
                            !isCompatible && styles.incompatibleModification
                          ]}
                          onPress={() => isCompatible && selectModification(mod.id, slot)}
                          disabled={!isCompatible}
                        >
                          <Text style={[
                            styles.modificationName,
                            isSelected && styles.selectedModificationText,
                            !isCompatible && styles.incompatibleModificationText
                          ]}>
                            {mod.Name}
                          </Text>
                          
                          {mod.Prefix && (
                            <Text style={styles.modificationPrefix}>({mod.Prefix})</Text>
                          )}
                          
                          {mod.EffectDescription && (
                            <Text style={styles.modificationEffects}>{mod.EffectDescription}</Text>
                          )}
                          
                          <Text style={styles.modificationStats}>
                            Сложность: {mod.Complexity} | Цена: {mod.Cost} крышек | 
                            Вес: {mod.Weight > 0 ? '+' : ''}{mod.Weight || 0}
                          </Text>
                          
                          {mod['Perk 1'] && (
                            <Text style={styles.modificationPerk}>Требует: {mod['Perk 1']}</Text>
                          )}
                          
                          {!isCompatible && (
                            <Text style={styles.incompatibleText}>
                              Не совместимо с этим оружием
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </CollapsibleSection>
                );
              })}

              {Object.keys(groupedMods).length === 0 && (
                <View style={styles.noModsSection}>
                  <Text style={styles.noModsText}>
                    Для этого оружия нет доступных модификаций
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.weaponInfo}>
              <Text style={styles.weaponTitle}>{displayName}</Text>
              <Text style={styles.weaponStats}>
                Урон: {modifiedWeapon?.['Damage Rating'] || modifiedWeapon?.Урон || weapon['Damage Rating'] || weapon.Урон || 0} | 
                Скорость: {modifiedWeapon?.['Rate of Fire'] || modifiedWeapon?.['Скорость стрельбы'] || weapon['Rate of Fire'] || weapon['Скорость стрельбы'] || 0} | 
                Дальность: {modifiedWeapon?.Range || modifiedWeapon?.Дальность || weapon.Range || weapon.Дальность || 'C'} | 
                Вес: {modifiedWeapon?.Weight || modifiedWeapon?.Вес || weapon.Weight || weapon.Вес || 0}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              onPress={resetModifications} 
              style={[
                styles.cancelButton, 
                Object.keys(selectedModifications).length === 0 && styles.disabledButton
              ]}
              disabled={Object.keys(selectedModifications).length === 0}
            >
              <Text style={styles.cancelButtonText}>Сбросить</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={applyModifications} 
              style={[
                styles.applyButton, 
                Object.keys(selectedModifications).length === 0 && styles.disabledButton
              ]}
              disabled={Object.keys(selectedModifications).length === 0}
            >
              <Text style={styles.applyButtonText}>
                Применить ({Object.keys(selectedModifications).length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Стили остаются те же...
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  modalBody: {
    padding: 15,
  },
  modificationsSection: {
    marginBottom: 20,
  },
  weaponInfo: {
    marginTop: 20,
    marginBottom: 0,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  weaponTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  weaponStats: {
    fontSize: 12,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  collapsibleSection: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expandIcon: {
    fontSize: 16,
    color: '#666',
  },
  sectionContent: {
    paddingLeft: 10,
    paddingTop: 5,
  },
  modificationItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 5,
  },
  selectedModification: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  incompatibleModification: {
    opacity: 0.5,
    borderColor: '#ddd',
  },
  modificationName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedModificationText: {
    color: '#007AFF',
  },
  incompatibleModificationText: {
    color: '#999',
  },
  modificationPrefix: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
  },
  modificationEffects: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
  },
  modificationStats: {
    fontSize: 11,
    color: '#666',
    marginTop: 3,
  },
  modificationPerk: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 3,
    fontStyle: 'italic',
  },
  incompatibleText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 5,
    fontStyle: 'italic',
  },
  noModsSection: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noModsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
  },
  applyButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    flex: 1,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WeaponModificationModal;