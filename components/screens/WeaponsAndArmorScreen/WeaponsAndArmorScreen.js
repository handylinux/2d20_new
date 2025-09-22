import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useCharacter } from '../../CharacterContext';
import weapons from '../../../assets/Equipment/weapons.json';
import ammo from '../../../assets/Equipment/ammo.json';
import { calculateInitiative, calculateDefense, calculateMeleeBonus, calculateMaxHealth } from '../CharacterScreen/logic/characterLogic';
import { getFireRateWithPerk } from '../CharacterScreen/logic/perksLogic';
import styles from '../../../styles';
import { renderTextWithIcons } from './textUtils';
import { computeModifiedWeapon } from '../InventoryScreen/modals/weaponModificationUtils';
import { convertWeaponIdToDisplayName } from '../InventoryScreen/modals/weaponNameUtils'; // ← ДОБАВЬ ЭТО

// 🔄 Подготовка для мультиязычности: файлы полей (можно вынести в отдельные файлы fieldKeysEn.js и fieldKeysRu.js)
const enFieldKeys = {
  damageRating: 'Damage Rating',
  damageEffects: 'Damage Effects',
  qualities: 'Qualities',
  range: 'Range',
  damageType: 'Damage Type',
};

const ruFieldKeys = {
  damageRating: 'Урон', // Пример перевода; подставь реальные из локализации
  damageEffects: 'Эффекты урона',
  qualities: 'Качества',
  range: 'Дальность',
  damageType: 'Тип урона',
};

// Выбор языка (в будущем из контекста или props; сейчас 'en' по умолчанию для твоего JSON)
const currentLanguage = 'en'; // Можно сделать динамичным: const { language } = useCharacter(); или подобное
const fieldKeys = currentLanguage === 'ru' ? ruFieldKeys : enFieldKeys;

// 🔄 Функция для получения информации о патронах
const getAmmoInfo = (ammoId) => {
  if (!ammoId) return null;

  // Если ammoId содержит несколько значений (разделенных запятой), берем первое
  const primaryAmmoId = ammoId.split(',')[0].trim();
  const ammoInfo = ammo.find(a => a.id === primaryAmmoId);

  return ammoInfo ? {
    id: ammoInfo.id,
    name: ammoInfo.name,
    rarity: ammoInfo.rarity,
    cost: ammoInfo.cost
  } : null;
};

const HealthCounter = ({ max }) => {
  const { currentHealth, setCurrentHealth } = useCharacter();

  const handleAdjustHealth = (amount) => {
    setCurrentHealth(prev => Math.max(0, Math.min(max, prev + amount)));
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity onPress={() => handleAdjustHealth(-1)} style={styles.counterButton}>
        <Text style={styles.counterButtonText}>-</Text>
      </TouchableOpacity>
      <Text style={[styles.counterValue, { minWidth: 50, textAlign: 'center' }]}>{`${currentHealth}/${max}`}</Text>
      <TouchableOpacity onPress={() => handleAdjustHealth(1)} style={styles.counterButton}>
        <Text style={styles.counterButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const AmmoCounter = ({ ammoId, ammoName, weaponName }) => {
  const { getAmmoCount, adjustAmmoCount } = useCharacter();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const currentAmmo = ammoId ? getAmmoCount(ammoId) : 0;

  const handleSpendAmmo = () => {
    const success = adjustAmmoCount(ammoId, -1);
    if (success) {
      console.log(`[AmmoCounter] Ammo spent for ${weaponName}: 1`);
    }
  };

  const handleEditStart = () => {
    setEditValue(currentAmmo.toString());
    setIsEditing(true);
  };

  const handleEditConfirm = () => {
    const newValue = parseInt(editValue) || 0;
    const difference = newValue - currentAmmo;
    if (difference !== 0) {
      adjustAmmoCount(ammoId, difference);
      console.log(`[AmmoCounter] Ammo set for ${weaponName}: ${currentAmmo} -> ${newValue}`);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  // Всегда показываем, но если нет патронов - показываем "Нет"

  return (
    <View style={localStyles.ammoContainer}>
      <Text style={localStyles.ammoTitle}>Патроны</Text>
      <View style={localStyles.ammoValueContainer}>
        {ammoId && currentAmmo > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={handleSpendAmmo} style={styles.counterButton}>
              <Text style={styles.counterButtonText}>-</Text>
            </TouchableOpacity>
            {isEditing ? (
              <TextInput
                style={[styles.counterValue, { minWidth: 50, textAlign: 'center' }]}
                value={editValue}
                onChangeText={setEditValue}
                keyboardType="numeric"
                autoFocus
                onBlur={handleEditCancel}
                onSubmitEditing={handleEditConfirm}
              />
            ) : (
              <TouchableOpacity onPress={handleEditStart}>
                <Text style={[styles.counterValue, { minWidth: 50, textAlign: 'center' }]}>
                  {currentAmmo}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={[styles.counterValue, { minWidth: 50, textAlign: 'center', color: '#999' }]}>
            Нет
          </Text>
        )}
      </View>
    </View>
  );
};

const StatBox = ({ title, value, children }) => (
  <View style={localStyles.statBoxContainer}>
    <View style={localStyles.statBoxHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={localStyles.statBoxValueContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        {title === "Бонус Б.Боя" ? renderTextWithIcons(String(value).replace('{CD}', ' {CD}'), styles.statValue) : <Text style={styles.statValue}>{value}</Text>}
        {children}
      </View>
    </View>
  </View>
);

const ArmorPart = ({ title, subtitle, armorName, clothingName, stats }) => {
  const displayName = [clothingName, armorName].filter(Boolean).join(' / ');

  return (
    <View style={localStyles.armorPartContainer}>
      <View style={[styles.sectionHeader, { flexDirection: 'column', alignItems: 'center', paddingBottom: displayName ? 2 : 4, minHeight: 50 }]}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={[styles.sectionTitle, { fontSize: 12 }]}>{subtitle}</Text>
        {displayName ? <Text style={localStyles.armorItemNameTitle}>{displayName}</Text> : null}
      </View>
      <View style={localStyles.armorStatsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={[localStyles.armorStatRow, { borderBottomWidth: index === stats.length - 1 ? 0 : 1 }]}>
            <Text style={localStyles.armorStatLabel}>{stat.label}</Text>
            <Text style={localStyles.armorStatValue}>{stat.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// 🔁 WeaponCard — КРАСИВОЕ ОТОБРАЖЕНИЕ ИМЕНИ
const WeaponCard = ({ weapon, onUnequipWeapon, displayFireRate, slotIndex }) => {
  const { hasTrait } = useCharacter();
  
  if (!weapon) {
    return (
      <View style={localStyles.weaponCardContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { textAlign: 'center', width: '100%' }]}>Пустой слот</Text>
        </View>
        <View style={localStyles.emptyWeaponStats}>
          <Text>Оружие не надето</Text>
        </View>
      </View>
    );
  }

  // 🔁 Вычисляем модифицированное оружие
  const computedWeapon = computeModifiedWeapon(weapon, weapon.appliedModIds || []);
  
  // 🔁 ГЕНЕРИРУЕМ ЧЕЛОВЕКОЧИТАЕМОЕ ИМЯ
  const weaponId = weapon.weaponId || weapon.id || weapon.instanceId;
  const displayName = weaponId ? convertWeaponIdToDisplayName(weaponId) : (weapon.Name || weapon.Название || weapon.name || 'Неизвестное оружие');
  
  // Если это уже модифицированный экземпляр с appliedModIds — используем полное имя
  if (weapon.appliedModIds && weapon.appliedModIds.length > 0) {
    const fullInstanceId = weapon.instanceId || weapon.uniqueId;
    if (fullInstanceId && fullInstanceId.includes('_')) {
      const fullDisplayName = convertWeaponIdToDisplayName(fullInstanceId);
      if (fullDisplayName !== displayName) {
        displayName = fullDisplayName;
      }
    }
  }
  
  console.log('[WeaponCard] Display name for weapon:', { 
    weaponId, 
    instanceId: weapon.instanceId, 
    uniqueId: weapon.uniqueId, 
    appliedModIds: weapon.appliedModIds,
    displayName 
  });
  
  const ncrInfantryBonusMap = new Set([
    'Пистолет-пулемёт Томпсона',
    'Боевой карабин',
    'Штурмовая винтовка',
    'Осколочная граната',
    'Боевой нож'
  ]);

  const isNcrInfantryWeapon = ncrInfantryBonusMap.has(weapon.Name || weapon.Название);

  // 🔄 Исправление: используем переменные ключи для чтения полей напрямую из computedWeapon (для базового/модифицированного)
  const baseDamage = computedWeapon[fieldKeys.damageRating] || 0;
  const damageWithNcr = hasTrait('Пехотинец') && isNcrInfantryWeapon ? baseDamage + 1 : baseDamage;

  // 🔄 Получаем информацию о патронах
  const ammoInfo = getAmmoInfo(computedWeapon.Ammo);
  const hasAmmo = computedWeapon.Ammo && computedWeapon.Ammo.trim() !== '';

  const stats = [
    { label: 'ТИП УРОНА', value: computedWeapon[fieldKeys.damageType] || 'Physical' },
    { label: 'УРОН', value: `${damageWithNcr} {CD}` },
    { label: 'ЭФФЕКТ', value: computedWeapon[fieldKeys.damageEffects] || '' },
    { label: 'СКОРОСТЬ СТРЕЛЬБЫ', value: displayFireRate },
    { label: 'ДИСТАНЦИЯ', value: computedWeapon[fieldKeys.range] || 'M' },
    { label: 'КАЧЕСТВА', value: computedWeapon[fieldKeys.qualities] || '' },
    { label: 'ПАТРОНЫ', value: ammoInfo ? ammoInfo.name : 'Нет' },
    { label: 'ДЕЙСТВИЕ', type: 'button' }
  ];

  return (
    <View style={localStyles.weaponCardContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { textAlign: 'center', width: '100%' }]} numberOfLines={2}>
          {displayName}
        </Text>
      </View>
      <View>
        {stats.map((stat, index) => (
          <View key={index} style={[localStyles.weaponStatRow, { borderBottomWidth: 1 }]}>
            <Text style={localStyles.weaponStatLabel}>{stat.label}</Text>
            {stat.type === 'button' ? (
              <TouchableOpacity
                style={localStyles.unequipButton}
                onPress={() => {
                  console.log('[WeaponCard] Unequipping weapon:', {
                    id: weapon.id,
                    uniqueId: weapon.uniqueId,
                    instanceId: weapon.instanceId,
                    name: weapon.Название || weapon.name,
                    displayName
                  });
                  onUnequipWeapon(weapon, slotIndex);
                }}
              >
                <Text style={localStyles.unequipButtonText}>Снять</Text>
              </TouchableOpacity>
            ) : stat.value.includes('{CD}') ? (
              renderTextWithIcons(stat.value, localStyles.weaponStatValue)
            ) : (
              <Text style={localStyles.weaponStatValue}>{stat.value}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

// 🔁 WeaponsAndArmorScreen — без изменений
const WeaponsAndArmorScreen = () => {
  const {
    attributes,
    equippedArmor,
    equippedWeapons,
    setEquippedWeapons,
    trait,
    level,
    effects,
    origin,
    selectedPerks,
    hasTrait,
    equipment,
    setEquipment,
    handleUnequipWeapon: contextUnequipWeapon,
    getModifiedItem,
    getCanonicalItemKey,
  } = useCharacter();

  const handleUnequipWeapon = (weapon, slotIndex) => {
    console.log('[WeaponsAndArmorScreen] handleUnequipWeapon:', {
      id: weapon?.id,
      uniqueId: weapon?.uniqueId,
      instanceId: weapon?.instanceId,
      name: weapon?.Название || weapon?.name,
      slotIndex
    });

    if (!weapon || slotIndex === undefined) {
      console.error('[WeaponsAndArmorScreen] Invalid unequip parameters');
      return false;
    }

    const success = contextUnequipWeapon(weapon, slotIndex);
    
    if (success) {
      console.log('[WeaponsAndArmorScreen] Weapon unequipped successfully via context');
    } else {
      console.log('[WeaponsAndArmorScreen] Failed to unequip weapon via context');
    }
    
    return success;
  };

  const initiative = calculateInitiative(attributes);
  const defense = calculateDefense(attributes);
  const meleeBonus = calculateMeleeBonus(attributes);
  const maxHealth = calculateMaxHealth(attributes, level);

  const hasRadImmunity = effects.includes('Иммунитет к радиации') || origin?.immunity?.radiation;
  const hasPoisonImmunity = effects.includes('Иммунитет к ядам') || origin?.immunity?.poison;

  const renderArmorPart = (slotKey) => {
    const configs = {
      head: { title: 'Голова', subtitle: '1-3' },
      body: { title: 'Торс', subtitle: '4-11' },
      leftArm: { title: 'Левая Рука', subtitle: '12-15' },
      rightArm: { title: 'Правая Рука', subtitle: '16-18' },
      leftLeg: { title: 'Левая Нога', subtitle: '19' },
      rightLeg: { title: 'Правая Нога', subtitle: '20' },
    };

    const config = configs[slotKey];
    const armorItem = equippedArmor[slotKey].armor;
    const clothingItem = equippedArmor[slotKey].clothing;

    const physDef = (armorItem?.phys_def || 0) + (clothingItem?.phys_def || 0);
    const energyDef = (armorItem?.energy_def || 0) + (clothingItem?.energy_def || 0);
    const radDef = (armorItem?.rad_def || 0) + (clothingItem?.rad_def || 0);

    const stats = [
      { label: 'Физ.Су', value: physDef > 0 ? physDef : '00' },
      { label: 'Эн.Су', value: energyDef > 0 ? energyDef : '00' },
      { label: 'Рад.Су', value: hasRadImmunity ? '∞' : (radDef > 0 ? radDef : '00') },
    ];

    return (
      <ArmorPart
        key={slotKey}
        title={config.title}
        subtitle={config.subtitle}
        armorName={armorItem?.Название}
        clothingName={clothingItem?.Название}
        stats={stats}
      />
    );
  };

  return (
    <ImageBackground
      source={require('../../../assets/bg.png')}
      style={localStyles.background}
      imageStyle={{ opacity: 0.3 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ backgroundColor: 'transparent' }} contentContainerStyle={[styles.scrollContent, { paddingHorizontal: '2.5%' }]}>
          <View style={{ marginBottom: 16 }}>
            <View style={localStyles.statsRow}>
              <StatBox title="Инициатива" value={initiative} />
              <StatBox title="Защита" value={defense} />
              <StatBox title="Бонус Б.Боя" value={meleeBonus} />
            </View>
            <View style={[localStyles.statsRow, { marginTop: 8 }]}>
              <StatBox title="Зависимость" />
              <StatBox title="Сопр. Яду" value={hasPoisonImmunity ? '∞' : '0'} />
              <StatBox title="Здоровье" max={maxHealth}>
                <HealthCounter max={maxHealth} />
              </StatBox>
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <View style={localStyles.statsRow}>
              {renderArmorPart('leftArm')}
              {renderArmorPart('head')}
              {renderArmorPart('rightArm')}
            </View>
            <View style={[localStyles.statsRow, { marginTop: 8 }]}>
              {renderArmorPart('leftLeg')}
              {renderArmorPart('body')}
              {renderArmorPart('rightLeg')}
            </View>
          </View>

          <View>
            <View style={localStyles.statsRow}>
              {equippedWeapons.map((weapon, index) => {
                const { displayFireRate } = getFireRateWithPerk(weapon, selectedPerks, hasTrait);
                // Создаем уникальный ключ для каждого слота оружия
                const uniqueKey = `weapon-slot-${index}-${weapon?.uniqueId || weapon?.instanceId || 'empty'}-${Date.now()}`;
                return (
                  <WeaponCard
                    key={uniqueKey}
                    weapon={weapon}
                    onUnequipWeapon={handleUnequipWeapon}
                    displayFireRate={displayFireRate}
                    slotIndex={index}
                  />
                );
              })}
            </View>
          </View>

          {/* Отдельная область для патронов - показывается только если есть хотя бы одно оружие с патронами */}
          {equippedWeapons.some(weapon => {
            const computedWeapon = weapon ? computeModifiedWeapon(weapon, weapon.appliedModIds || []) : null;
            const ammoInfo = computedWeapon ? getAmmoInfo(computedWeapon.Ammo) : null;
            const hasAmmo = computedWeapon?.Ammo && computedWeapon.Ammo.trim() !== '';
            return weapon && hasAmmo && ammoInfo;
          }) && (
            <View style={{ marginTop: 16 }}>
              <View style={localStyles.statsRow}>
                {equippedWeapons.map((weapon, index) => {
                  const computedWeapon = weapon ? computeModifiedWeapon(weapon, weapon.appliedModIds || []) : null;
                  const ammoInfo = computedWeapon ? getAmmoInfo(computedWeapon.Ammo) : null;
                  const hasAmmo = computedWeapon?.Ammo && computedWeapon.Ammo.trim() !== '';
                  const weaponId = weapon?.weaponId || weapon?.id || weapon?.instanceId || 'empty';

                  // Всегда показываем AmmoCounter для оружия
                  if (weapon && hasAmmo && ammoInfo) {
                    return (
                      <AmmoCounter
                        key={`ammo-${index}-${weaponId}-${Date.now()}`}
                        ammoId={computedWeapon.Ammo}
                        ammoName={ammoInfo.name}
                        weaponName={convertWeaponIdToDisplayName(weaponId)}
                      />
                    );
                  } else {
                    // Для оружия без патронов показываем AmmoCounter без ammoId
                    return (
                      <AmmoCounter
                        key={`empty-ammo-${index}-${weaponId}-${Date.now()}`}
                        ammoId={null}
                        ammoName={null}
                        weaponName={convertWeaponIdToDisplayName(weaponId)}
                      />
                    );
                  }
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

// Стили без изменений
const localStyles = StyleSheet.create({
  background: {
    flex: 1,
    paddingHorizontal: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  statBoxContainer: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#5a5a5a',
    borderRadius: 5,
    flexDirection: 'column',
  },
  statBoxHeader: {
    backgroundColor: '#000',
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  statBoxValueContainer: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  armorItemNameTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
    paddingHorizontal: 4,
    textAlign: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  armorPartContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  armorStatsContainer: {
    borderWidth: 1,
    borderColor: '#5a5a5a',
    borderTopWidth: 0,
    borderRadius: 5,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: 'hidden'
  },
  armorStatRow: {
    flexDirection: 'row',
    borderBottomColor: '#5a5a5a',
  },
  armorStatLabel: {
    color: styles.derivedTitle.color,
    fontSize: styles.derivedTitle.fontSize,
    flex: 1,
    padding: 5,
    backgroundColor: '#fce5cd'
  },
  armorStatValue: {
    color: styles.derivedValue.color,
    fontWeight: styles.derivedValue.fontWeight,
    fontSize: 12,
    padding: 5,
    minWidth: 40,
    textAlign: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#5a5a5a',
    backgroundColor: '#fff'
  },
  weaponCardContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyWeaponStats: {
    borderWidth: 1,
    borderColor: '#5a5a5a',
    borderTopWidth: 0,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
    minHeight: 100,
  },
  weaponStatRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#5a5a5a',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  weaponStatLabel: {
    backgroundColor: '#333',
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
    padding: 8,
    fontSize: 12,
  },
  weaponStatValue: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    borderLeftWidth: 1,
    borderColor: '#5a5a5a',
    backgroundColor: '#fff',
    textAlign: 'center'
  },
  unequipButton: {
    flex: 1,
    padding: 8,
    borderLeftWidth: 1,
    borderColor: '#5a5a5a',
    backgroundColor: '#ffc107',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unequipButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  ammoContainer: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#5a5a5a',
    borderRadius: 5,
    flexDirection: 'column',
    minHeight: 80, // Минимальная высота для контейнера патронов
  },
  ammoTitle: {
    backgroundColor: '#000',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 10,
    textAlign: 'center',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  ammoValueContainer: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  }
});

export default WeaponsAndArmorScreen;