// components/screens/CharacterScreen/logic/ammoLogic.js
import { calculateDamage, parseFormula } from './Calculator.js';

// Импортируем данные по оружию и патронам
import weapons from '../../../../assets/Equipment/weapons.json';
import allAmmo from '../../../../assets/Equipment/ammo.json'; // Теперь используем только ammo.json

const allWeapons = [...weapons];

/**
 * Находит оружие по ID и возвращает тип его патронов.
 * @param {string} weaponId - ID оружия.
 * @returns {string|null} Тип патронов (ID из ammo.json) или null.
 */
function getAmmoTypeForWeaponById(weaponId) {
  const weapon = allWeapons.find(w => w.id === weaponId);
  return weapon?.Ammo || null;
}

/**
 * Парсит формулу вида "X+Nfn{CD} <tag>" или "N <tag>".
 * @param {string} lootFormula - Формула для лута.
 * @returns {{quantityFormula: string, tag: string}|null}
 */
function parseLootFormula(lootFormula) {
    if (!lootFormula || typeof lootFormula !== 'string') return null;

    const regex = /^(.*?)<(\w+)>$/;
    const match = lootFormula.match(regex);

    if (match) {
        return {
            quantityFormula: match[1].trim(),
            tag: match[2].toLowerCase(),
        };
    }
    return null;
}

/**
 * Рассчитывает конкретный предмет и его количество на основе формулы лута.
 * @param {string} lootFormula - Формула, например "5+5fn{CD} <ammo>".
 * @param {object} context - Контекст, необходимый для некоторых тегов. Например, { weaponId: 'weapon_001' } для тега <ammo>.
 * @returns {{name: string, quantity: number, type: string, price?: number, weight?: any, rarity?: number}|null}
 */
export function resolveLoot(lootFormula, context) {
    const parsed = parseLootFormula(lootFormula);
    if (!parsed) {
        console.error(`Неверный формат формулы лута: "${lootFormula}"`);
        return null;
    }

    const { quantityFormula, tag } = parsed;

    const { baseValue, diceCount } = parseFormula(quantityFormula);
    const { finalValue: quantity } = calculateDamage(baseValue, diceCount);

    switch (tag) {
        case 'ammo':
            if (!context?.weaponId) {
                console.error("Для тега <ammo> требуется 'weaponId' в контексте.");
                return null;
            }

            const ammoTypeId = getAmmoTypeForWeaponById(context.weaponId); // Получаем ID боеприпаса для оружия
            if (!ammoTypeId) {
                console.warn(`Оружие с ID "${context.weaponId}" не имеет связанного типа боеприпасов.`);
                return null;
            }

            // Находим полные данные о боеприпасе в allAmmo (из ammo.json) по его ID
            const ammoDetails = allAmmo.find(ammoItem => ammoItem.id === ammoTypeId);

            if (!ammoDetails) {
                console.warn(`Детали для боеприпаса с ID "${ammoTypeId}" не найдены в ammo.json`);
                // Возвращаем базовые данные, если детали не найдены, с весом 0
                return { 
                    name: ammoTypeId, 
                    Name: ammoTypeId, 
                    quantity, 
                    type: 'ammo', 
                    itemType: 'ammo', 
                    Cost: 0, 
                    Weight: 0 
                };
            }

            return {
                ...ammoDetails,
                name: ammoDetails.name, // Используем name из ammo.json
                Name: ammoDetails.name, // Для единообразия в отображении
                quantity,
                Cost: ammoDetails.cost, // Используем cost из ammo.json
                Weight: 0, // Устанавливаем вес 0, так как ammo.json его не содержит
                itemType: 'ammo',
            };

        case 'caps':
            return { name: 'Крышки', Name: 'Крышки', quantity, type: 'currency', itemType: 'currency', Cost: 1, Weight: 0 };

        case 'basicmaterial':
            return { name: 'Базовые материалы', Name: 'Базовые материалы', quantity, type: 'material', itemType: 'material' };

        default:
            console.warn(`Неизвестный тег в формуле лута: <${tag}>`);
            return null;
    }
}