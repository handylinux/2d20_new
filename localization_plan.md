# План локализации приложения

## Цель
Подготовить React Native приложение к мультиязычности для русского и английского языков.

## Основные требования
- Все пользовательские интерфейсные элементы (кнопки, сообщения, заголовки) должны переключаться между ru и en
- Только названия экранов и метки должны быть локализованы (значения полей остаются русскими)
- Переключатель языка должен быть на всех экранах в верхнем правом углу
- По умолчанию используется русский язык

## Структура файлов локализации

### locales/ru.json
```json
{
  "navigation": {
    "character": "Персонаж",
    "character_tab": "Персонаж",
    "equipment": "Снаряжение",
    "equipment_tab": "Броня и оружие",
    "inventory": "Инвентарь",
    "inventory_tab": "Инвентарь",
    "perks": "Перки",
    "perks_tab": "Перки"
  },
  "screens": {
    "character": {
      "title": "Персонаж",
      "origin": "Происхождение",
      "trait": "Черта",
      "equipment": "Снаряжение",
      "level": "Уровень:",
      "attributes": "ХАРАКТЕРИСТИКИ",
      "skills": "НАВЫКИ",
      "attribute_points": "Очки Атрибутов",
      "tagged_skills": "Отмечено навыков",
      "skill_points": "Очки Навыков",
      "luck_points": "Очки\nУдачи",
      "save": "Сохранить",
      "reset": "Сбросить",
      "cancel": "Отмена",
      "confirm": "Согласен",
      "warning": "Внимание!",
      "attention_message": "Все значения будут сброшены к изначальным параметрам.",
      "error": "Ошибка",
      "select_origin": "Сначала выберите происхождение",
      "select_trait": "Сначала выберите черту",
      "select_equipment": "Сначала выберите комплект снаряжения",
      "spend_all_points": "Потратьте все очки атрибутов перед сохранением.",
      "distribute_all_skills": "Необходимо распределить все очки навыков.",
      "select_exactly_skills": "Необходимо выбрать ровно {count} основных навыка. Выбрано: {selected}",
      "select_additional_skills": "Необходимо выбрать {count} дополнительных навыка от черты. Выбрано: {selected}",
      "max_skill_rank": "Максимальный ранг навыков - {maxRank}",
      "cannot_deselect_forced_skill": "Нельзя снять выбор с обязательного навыка",
      "distribute_attributes_first": "Сначала распределите и сохраните атрибуты",
      "not_enough_skill_points": "У вас не осталось очков навыков для распределения.",
      "too_many_tagged_skills": "Отметка этого навыка превысит максимальный ранг ({maxRank}). Сначала понизьте его значение.",
      "choose_origin": "Выберите происхождение",
      "origin_selected": "Уровень: {level}",
      "skills_available": "Доступно: {points} очков",
      "no_origin": "Не выбрано",
      "no_trait": "Не выбрано",
      "no_equipment": "Не выбрано",
      "attributes_saved": "Атрибуты сохранены",
      "skills_saved": "Навыки сохранены",
      "health_restored": "Восстановлено {amount} единиц здоровья.",
      "item_applied": "{item} применен на вас.",
      "change_origin": "Сменить происхождение? Все ваши атрибуты, навыки и черты будут сброшены. Вы уверены?",
      "change_equipment": "Внимание! При выборе нового комплекта снаряжения весь текущий инвентарь будет сброшен. Продолжить?",
      "equipment_will_be_reset": "Инвентарь и всё снаряжение будет сброшено. Продолжить?",
      "no_equipment_for_origin": "Для данного происхождения нет комплектов снаряжения.",
      "trait_selected": "Черта для этого происхождения уже выбрана.",
      "no_traits_for_origin": "Для данного происхождения нет доступных черт",
      "unequip": "Снять",
      "equip": "Надеть",
      "apply": "Применить",
      "modify": "Модиф.",
      "sell": "Продать",
      "add": "Внести",
      "subtract": "Списать",
      "caps": "Крышки",
      "total_weight": "Общий вес: {weight}",
      "total_price": "Общая цена: {price}",
      "inventory_empty": "Инвентарь пуст",
      "item_not_equippable": "Этот хлам нельзя надеть.",
      "item_not_weapon": "Это не оружие, тупица. Только оружие экипируется в слоты оружия.",
      "no_available_items": "Нет доступных предметов для экипировки.",
      "replace_weapon": "Заменить оружие 1?",
      "which_weapon_replace": "Какое оружие вы хотите заменить?",
      "weapon_1": "Оружие 1",
      "weapon_2": "Оружие 2",
      "item_not_armor": "Это нельзя надеть, кретин. Только броня и одежда экипируются на тело.",
      "equipment_replacement": "Надетые предметы будут сняты, чтобы освободить место. Продолжить?",
      "item_cannot_be_removed": "Это нельзя снять, потому что его нельзя было надеть.",
      "not_chem": "Это не химикат, мозги включи.",
      "apply_chem": "Применение химиката",
      "apply_to_self": "На себя",
      "apply_to_other": "На другого",
      "apply_to_self_question": "Вы хотите применить {item} на себя или другого персонажа?",
      "applied_successfully": "Успешно",
      "applied_to_self": "Применено",
      "applied_to_other": "Применено на другого персонажа.",
      "not_weapon_for_modification": "Модифицировать можно только оружие, идиот.",
      "quantity": "Кол-во: {quantity} шт.",
      "price": "Цена: {price}",
      "weight": "Вес: {weight}",
      "modified": "⚙️"
    },
    "inventory": {
      "title": "Инвентарь",
      "item": "ПРЕДМЕТ",
      "action": "ДЕЙСТВИЕ"
    }
  },
  "common": {
    "language": "Язык",
    "russian": "Русский",
    "english": "English"
  }
}
```

### locales/en.json
```json
{
  "navigation": {
    "character": "Character",
    "character_tab": "Character",
    "equipment": "Equipment",
    "equipment_tab": "Armor & Weapons",
    "inventory": "Inventory",
    "inventory_tab": "Inventory",
    "perks": "Perks",
    "perks_tab": "Perks"
  },
  "screens": {
    "character": {
      "title": "Character",
      "origin": "Origin",
      "trait": "Trait",
      "equipment": "Equipment",
      "level": "Level:",
      "attributes": "ATTRIBUTES",
      "skills": "SKILLS",
      "attribute_points": "Attribute Points",
      "tagged_skills": "Tagged Skills",
      "skill_points": "Skill Points",
      "luck_points": "Luck\nPoints",
      "save": "Save",
      "reset": "Reset",
      "cancel": "Cancel",
      "confirm": "Confirm",
      "warning": "Warning!",
      "attention_message": "All values will be reset to initial parameters.",
      "error": "Error",
      "select_origin": "Please select an origin first",
      "select_trait": "Please select a trait first",
      "select_equipment": "Please select equipment kit first",
      "spend_all_points": "Spend all attribute points before saving.",
      "distribute_all_skills": "You must distribute all skill points.",
      "select_exactly_skills": "You must select exactly {count} main skills. Selected: {selected}",
      "select_additional_skills": "You must select {count} additional skills from trait. Selected: {selected}",
      "max_skill_rank": "Maximum skill rank is {maxRank}",
      "cannot_deselect_forced_skill": "Cannot deselect forced skill",
      "distribute_attributes_first": "Please distribute and save attributes first",
      "not_enough_skill_points": "You don't have enough skill points left.",
      "too_many_tagged_skills": "Tagging this skill would exceed the maximum rank ({maxRank}). Please reduce its value first.",
      "choose_origin": "Choose Origin",
      "origin_selected": "Level: {level}",
      "skills_available": "Available: {points} points",
      "no_origin": "Not selected",
      "no_trait": "Not selected",
      "no_equipment": "Not selected",
      "attributes_saved": "Attributes saved",
      "skills_saved": "Skills saved",
      "health_restored": "{amount} health points restored.",
      "item_applied": "{item} applied to you.",
      "change_origin": "Change origin? All your attributes, skills and traits will be reset. Are you sure?",
      "change_equipment": "Warning! When selecting a new equipment kit, all current inventory will be reset. Continue?",
      "equipment_will_be_reset": "Inventory and all equipment will be reset. Continue?",
      "no_equipment_for_origin": "No equipment kits available for this origin.",
      "trait_selected": "Trait for this origin is already selected.",
      "no_traits_for_origin": "No available traits for this origin",
      "unequip": "Unequip",
      "equip": "Equip",
      "apply": "Apply",
      "modify": "Modify",
      "sell": "Sell",
      "add": "Add",
      "subtract": "Subtract",
      "caps": "Caps",
      "total_weight": "Total weight: {weight}",
      "total_price": "Total price: {price}",
      "inventory_empty": "Inventory is empty",
      "item_not_equippable": "This item cannot be equipped.",
      "item_not_weapon": "This is not a weapon, fool. Only weapons can be equipped in weapon slots.",
      "no_available_items": "No available items for equipping.",
      "replace_weapon": "Replace weapon 1?",
      "which_weapon_replace": "Which weapon would you like to replace?",
      "weapon_1": "Weapon 1",
      "weapon_2": "Weapon 2",
      "item_not_armor": "This cannot be equipped, moron. Only armor and clothing can be equipped on body.",
      "equipment_replacement": "Equipped items will be removed to make space. Continue?",
      "item_cannot_be_removed": "This item cannot be removed because it couldn't be equipped.",
      "not_chem": "This is not a chem, turn your brain on.",
      "apply_chem": "Apply Chem",
      "apply_to_self": "To self",
      "apply_to_other": "To other",
      "apply_to_self_question": "Do you want to apply {item} to yourself or another character?",
      "applied_successfully": "Successfully",
      "applied_to_self": "Applied",
      "applied_to_other": "Applied to another character.",
      "not_weapon_for_modification": "Only weapons can be modified, idiot.",
      "quantity": "Qty: {quantity} pcs.",
      "price": "Price: {price}",
      "weight": "Weight: {weight}",
      "modified": "⚙️"
    },
    "inventory": {
      "title": "Inventory",
      "item": "ITEM",
      "action": "ACTION"
    }
  },
  "common": {
    "language": "Language",
    "russian": "Русский",
    "english": "English"
  }
}
```

## Архитектура решения

### 1. Контекст локализации
Создать `LocalizationContext` для управления текущим языком и предоставления функций перевода.

### 2. Хук useTranslation
Создать кастомный хук для удобного доступа к переводам с поддержкой параметров.

### 3. Компонент переключателя языка
Создать компонент `LanguageSwitcher` для переключения между языками в верхнем правом углу.

### 4. Функция локализации
Создать функцию `t(key, params)` для получения переведенных строк с подстановкой параметров.

## Этапы реализации

1. **Создать структуру файлов локализации**
2. **Создать контекст и хуки локализации**
3. **Создать компонент переключателя языка**
4. **Обновить App.js для поддержки локализации**
5. **Локализовать CharacterScreen**
6. **Локализовать InventoryScreen**
7. **Локализовать остальные экраны**
8. **Добавить переключатель на все экраны**
9. **Тестирование**

## Mermaid диаграмма архитектуры

```mermaid
graph TD
    A[App] --> B[LocalizationProvider]
    B --> C[Navigation]
    B --> D[CharacterScreen]
    B --> E[InventoryScreen]
    B --> F[EquipmentScreen]
    B --> G[PerksScreen]

    B --> H[LanguageSwitcher]
    H --> I[Language Context]

    C --> J[Navigation Labels]
    D --> K[Screen Labels]
    E --> L[Screen Labels]

    M[locales/ru.json] --> I
    N[locales/en.json] --> I

    J --> O[t function]
    K --> O
    L --> O

    O --> P[Translation Strings]