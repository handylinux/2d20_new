/**
 * Симуляция броска одного Combat Dice (CD) с особыми значениями
 * 1 -> 1
 * 2 -> 2
 * 3 -> 0
 * 4 -> 0
 * 5 -> 1
 * 6 -> 1
 * 
 * @returns {number} Результат броска одного кубика (0, 1, или 2)
 */
export function rollCombatDice() {
  // Генерируем случайное число от 1 до 6 (имитация броска шестигранного кубика)
  const roll = Math.floor(Math.random() * 6) + 1;
  
  // Преобразуем результат броска согласно правилам
  switch (roll) {
    case 1: return 1;
    case 2: return 2;
    case 3: return 0;
    case 4: return 0;
    case 5: return 1;
    case 6: return 1;
    default: return 0; // На всякий случай
  }
}

/**
 * Бросок произвольного количества кастомных кубиков
 * 
 * @param {string} diceString - Строка в формате "2d20", "d6", "1d100"
 * @returns {number} Сумма результатов бросков
 */
export function rollCustomDice(diceString) {
  const parts = diceString.toLowerCase().split('d');
  const numDice = parts[0] ? parseInt(parts[0], 10) : 1;
  const numSides = parseInt(parts[1], 10);
  
  if (isNaN(numDice) || isNaN(numSides) || numSides <= 0) {
    console.error("Invalid dice string format:", diceString);
    return 0;
  }

  let total = 0;
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * numSides) + 1;
  }
  return total;
}

/**
 * Бросок нескольких Combat Dice и суммирование результатов
 * 
 * @param {number} diceCount - Количество кубиков для броска
 * @returns {number} Сумма результатов бросков
 */
export function rollMultipleCombatDice(diceCount) {
  let total = 0;
  const rolls = [];
  
  for (let i = 0; i < diceCount; i++) {
    const roll = rollCombatDice();
    rolls.push(roll);
    total += roll;
  }
  
  return {
    total,
    rolls
  };
}

/**
 * Расчет итогового значения по формуле: Базовое значение + N*fn{CD}
 * 
 * @param {number} baseValue - Базовое значение
 * @param {number} diceCount - Количество кубиков CD
 * @returns {Object} Объект с итоговым значением и подробностями расчета
 */
export function calculateDamage(baseValue, diceCount) {
  const { total: diceTotal, rolls } = rollMultipleCombatDice(diceCount);
  const finalValue = baseValue + diceTotal;
  
  return {
    baseValue,
    diceCount,
    rolls,
    diceTotal,
    finalValue
  };
}

/**
 * Функция для форматирования формулы урона в текстовом виде
 * 
 * @param {number} baseValue - Базовое значение
 * @param {number} diceCount - Количество кубиков CD
 * @returns {string} Формула урона в текстовом виде
 */
export function formatDamageFormula(baseValue, diceCount) {
  if (diceCount === 0) return `${baseValue}`;
  return `${baseValue} + ${diceCount}fn{CD}`;
}

/**
 * Преобразовать текстовую формулу урона в параметры для расчета
 * Пример: "5+3fn{CD}" -> { baseValue: 5, diceCount: 3 }
 * 
 * @param {string} formula - Формула урона в текстовом виде
 * @returns {Object} Объект с параметрами baseValue и diceCount
 */
export function parseFormula(formula) {
  // Регулярное выражение для извлечения базового значения и количества кубиков
  const regex = /(\d+)\s*\+\s*(\d+)\s*fn\s*\{\s*CD\s*\}/i;
  const match = formula.match(regex);
  
  if (match) {
    return {
      baseValue: parseInt(match[1], 10),
      diceCount: parseInt(match[2], 10)
    };
  }
  
  // Если формула не содержит кубиков, пробуем извлечь просто число
  const simpleNumber = parseInt(formula, 10);
  if (!isNaN(simpleNumber)) {
    return {
      baseValue: simpleNumber,
      diceCount: 0
    };
  }
  
  // Если не удалось распарсить формулу
  throw new Error(`Неверный формат формулы урона: ${formula}`);
}