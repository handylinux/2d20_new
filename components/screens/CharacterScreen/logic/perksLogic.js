import lightWeapons from '../../../../assets/Equipment/weapons.json';
// Убираем адаптер - используем прямое обращение к полям

// Mapping from perks.json S.P.E.C.I.A.L abbreviations to internal attribute names
const ATTRIBUTE_CODE_TO_NAME = {
  STR: 'СИЛ',
  END: 'ВЫН',
  PER: 'ВСП',
  AGI: 'ЛОВ',
  INT: 'ИНТ',
  CHA: 'ХАР',
  LCK: 'УДЧ',
};

/**
 * Build a quick lookup map for current attribute values by internal name
 */
export function buildAttributeValueMap(attributes) {
  const map = {};
  for (const attr of attributes || []) {
    map[attr.name] = attr.value;
  }
  return map;
}

/**
 * Returns true if the character meets a specific perk's requirements.
 */
export function meetsPerkRequirements(perk, attributes, level) {
  if (!perk) return false;
  const req = perk.requirements || {};

  // Level requirement
  const requiredLevel = req.char_lvl;
  if (typeof requiredLevel === 'number' && level < requiredLevel) {
    return false;
  }

  // Attribute requirements
  const attrReq = req.attributes || {};
  if (attrReq && Object.keys(attrReq).length > 0) {
    const valueByName = buildAttributeValueMap(attributes);
    for (const [code, minVal] of Object.entries(attrReq)) {
      const internalName = ATTRIBUTE_CODE_TO_NAME[code];
      if (!internalName) continue; // unknown code, ignore gracefully
      const currentVal = valueByName[internalName] ?? 0;
      if (currentVal < minVal) return false;
    }
  }

  // Other requirements (e.g., "не робот") are ignored for now per scope
  return true;
}

/**
 * Returns a structured status for why a perk is not available.
 */
export function getPerkUnmetReasons(perk, attributes, level) {
  const reasons = { level: false, attributes: {} };
  if (!perk) return reasons;
  const req = perk.requirements || {};

  // Level
  const requiredLevel = req.char_lvl;
  if (typeof requiredLevel === 'number' && level < requiredLevel) {
    reasons.level = { required: requiredLevel, current: level };
  }

  // Attributes
  const attrReq = req.attributes || {};
  const valueByName = buildAttributeValueMap(attributes);
  for (const [code, minVal] of Object.entries(attrReq)) {
    const internalName = ATTRIBUTE_CODE_TO_NAME[code];
    if (!internalName) continue;
    const currentVal = valueByName[internalName] ?? 0;
    if (currentVal < minVal) {
      reasons.attributes[code] = { required: minVal, current: currentVal };
    }
  }

  return reasons;
}

/**
 * Helper to annotate a list of perks with availability status.
 */
export function annotatePerks(perks, attributes, level) {
  return (perks || []).map((perk) => {
    const available = meetsPerkRequirements(perk, attributes, level);
    const unmet = available ? null : getPerkUnmetReasons(perk, attributes, level);
    return { perk, available, unmet };
  });
}

/**
 * Calculates the fire rate for a weapon, applying the "ЛОВКИЕ РУКИ" perk if applicable.
 * Returns an object with base fire rate and display fire rate (with doubled value in parentheses if perk applies).
 */
// Helper function to get the base weapon name for modified weapons
function getBaseWeaponName(weapon) {
  // If weapon has originalName (for modified weapons), use it
  if (weapon.originalName) {
    return weapon.originalName;
  }
  
  // If weapon has weaponConfig, parse it to get base name
  const weaponName = weapon.Name || weapon.Название || weapon.name;
  if (weapon.weaponConfig && weapon.weaponConfig !== weaponName) {
    const parts = weapon.weaponConfig.split('+');
    return parts[0]; // First part is the base weapon name
  }
  
  // For regular weapons, return the current name
  return weaponName;
}

export function getFireRateWithPerk(weapon, selectedPerks, hasTrait) {
  if (!weapon) return { baseFireRate: 0, displayFireRate: '0' };

  const baseFireRate = weapon['Rate of Fire'] || weapon['Скорость стрельбы'] || 0;

  // Get the base weapon name for comparison
  const baseWeaponName = weapon.Name || weapon.Название || weapon.name;
  
  // Apply "Техника спуска" trait adjustment for light or energy weapons
  const isLightOrEnergy = lightWeapons.some(w => 
    w.id === weapon.id || 
    (w.Name || w.Название || w.name) === baseWeaponName
  );
  const fireRateWithTrait = hasTrait('Техника спуска') && isLightOrEnergy 
    ? Math.max(0, baseFireRate - 1) 
    : baseFireRate;

  // Check for "ЛОВКИЕ РУКИ" perk and if weapon is light
  const hasSleightOfHand = selectedPerks.some(p => p.perk_name === 'ЛОВКИЕ РУКИ');
  const isLightWeapon = lightWeapons.some(w => 
    w.id === weapon.id || 
    (w.Name || w.Название || w.name) === baseWeaponName
  );

  const displayFireRate = hasSleightOfHand && isLightWeapon 
    ? `${fireRateWithTrait} (${fireRateWithTrait * 2})` 
    : `${fireRateWithTrait}`;

  return { baseFireRate: fireRateWithTrait, displayFireRate };
}