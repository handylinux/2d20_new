import { Alert, Platform } from 'react-native';

/**
 * Кросс-платформенная утилита для отображения уведомлений
 * Работает как в нативных приложениях, так и в веб-версии
 */

/**
 * Отображает простое уведомление
 * @param {string} title - Заголовок уведомления
 * @param {string} message - Сообщение уведомления
 */
export const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

/**
 * Отображает уведомление с кнопками действий
 * @param {string} title - Заголовок уведомления
 * @param {string} message - Сообщение уведомления
 * @param {Array} buttons - Массив кнопок в формате [{text, onPress, style}]
 * @param {Object} options - Дополнительные опции (cancelable и т.д.)
 */
export const showAlertWithButtons = (title, message, buttons, options = {}) => {
  if (Platform.OS === 'web') {
    // Для веб создаем собственный диалог с несколькими кнопками
    const fullMessage = `${title}\n\n${message}`;

    // Создаем контейнер для диалога
    const dialogContainer = document.createElement('div');
    dialogContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;

    // Создаем диалог
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
    `;

    // Добавляем заголовок
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.cssText = `
      margin: 0 0 15px 0;
      color: #333;
      font-size: 18px;
    `;

    // Добавляем сообщение
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.cssText = `
      margin: 0 0 20px 0;
      color: #666;
      line-height: 1.4;
      white-space: pre-line;
    `;

    // Создаем контейнер для кнопок
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    `;

    // Создаем кнопки
    buttons.forEach((button, index) => {
      const btn = document.createElement('button');
      btn.textContent = button.text;
      btn.onclick = () => {
        document.body.removeChild(dialogContainer);
        button.onPress?.();
      };

      btn.style.cssText = `
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        min-width: 80px;
      `;

      // Стили для разных типов кнопок
      if (button.style === 'cancel') {
        btn.style.backgroundColor = '#6c757d';
        btn.style.color = 'white';
      } else {
        btn.style.backgroundColor = '#007bff';
        btn.style.color = 'white';
      }

      buttonContainer.appendChild(btn);
    });

    // Собираем диалог
    dialog.appendChild(titleElement);
    dialog.appendChild(messageElement);
    dialog.appendChild(buttonContainer);
    dialogContainer.appendChild(dialog);
    document.body.appendChild(dialogContainer);

    // Фокус на первую кнопку
    const firstButton = buttonContainer.querySelector('button');
    if (firstButton) {
      firstButton.focus();
    }

  } else {
    Alert.alert(title, message, buttons, options);
  }
};

/**
 * Специфичная функция для подтверждения действий (Yes/No)
 * @param {string} title - Заголовок
 * @param {string} message - Сообщение
 * @param {Function} onConfirm - Функция при подтверждении
 * @param {Function} onCancel - Функция при отмене (опционально)
 */
export const showConfirm = (title, message, onConfirm, onCancel = null) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}: ${message}`)) {
      onConfirm();
    } else {
      onCancel?.();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: "Отмена", style: "cancel", onPress: onCancel },
        { text: "Да", onPress: onConfirm }
      ]
    );
  }
};

// Экспортируем все функции по умолчанию
export default {
  showAlert,
  showAlertWithButtons,
  showConfirm
};