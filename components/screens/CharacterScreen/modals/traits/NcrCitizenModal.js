import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { TRAITS } from '../../logic/traitsData';

export const traitConfig = {
  originName: 'Житель НКР',
  modalType: 'choice'
};

const NcrCitizenModal = ({ visible, onSelect, onClose }) => {
  const [selectedTrait, setSelectedTrait] = useState(null);
  const [goodSoulPicks, setGoodSoulPicks] = useState([]);
  const allTraits = ['Добрая Душа', 'Пехотинец', 'Дом на пастбище', 'Техника спуска', 'Браминий барон'];
  const traits = allTraits.map(name => ({ name, description: TRAITS[name]?.description }));

  const goodSoulGroup = ['Красноречие', 'Медицина', 'Ремонт', 'Наука', 'Бартер'];

  const toggleGoodSoulPick = (skill) => {
    setGoodSoulPicks(prev => {
      if (prev.includes(skill)) return prev.filter(s => s !== skill);
      if (prev.length >= 2) return prev; // максимум 2
      return [...prev, skill];
    });
  };

  const handleTraitPress = (name) => {
    setSelectedTrait(name);
    if (name !== 'Добрая Душа') {
      // Сразу подтверждаем обычные черты
      onSelect(name, {});
      onClose();
    }
  };

  const handleGoodSoulConfirm = () => {
    if (goodSoulPicks.length !== 2) return;
    onSelect('Добрая Душа', {
      forcedSkills: [...goodSoulPicks],
      goodSoulSelectedSkills: [...goodSoulPicks],
      goodSoulGroup: goodSoulGroup,
    });
    setGoodSoulPicks([]);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Житель НКР — выберите черту</Text>
          {!selectedTrait && (
            <ScrollView style={{ width: '100%', maxHeight: 300 }}>
              {traits.map(trait => (
                <TouchableOpacity
                  key={trait.name}
                  style={[styles.modalButton, styles.skillOption]}
                  onPress={() => handleTraitPress(trait.name)}
                >
                  <Text style={styles.buttonText}>{trait.name}</Text>
                  <Text style={styles.descriptionText}>{trait.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {selectedTrait === 'Добрая Душа' && (
            <View style={{ width: '100%' }}>
              <Text style={[styles.descriptionText, { color: '#000', marginBottom: 8 }]}>Выберите два навыка из группы</Text>
              {goodSoulGroup.map(skill => {
                const isPicked = goodSoulPicks.includes(skill);
                return (
                  <TouchableOpacity
                    key={skill}
                    style={[styles.modalButton, styles.skillOption, isPicked && styles.selectedSkillOption]}
                    onPress={() => toggleGoodSoulPick(skill)}
                  >
                    <Text style={styles.buttonText}>{skill}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, goodSoulPicks.length !== 2 && styles.disabledButton]}
                onPress={handleGoodSoulConfirm}
                disabled={goodSoulPicks.length !== 2}
              >
                <Text style={styles.buttonText}>Подтвердить</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalButton: {
        padding: 12,
        marginVertical: 5,
        borderRadius: 6,
        alignItems: 'center',
        width: '100%',
    },
    skillOption: {
        backgroundColor: '#2196F3',
        alignItems: 'flex-start',
        paddingHorizontal: 15,
    },
    selectedSkillOption: {
        backgroundColor: '#1976D2',
        borderColor: '#fff',
        borderWidth: 2,
    },
    cancelButton: {
        backgroundColor: '#9E9E9E',
        marginTop: 10
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    descriptionText: {
        color: 'white',
        fontSize: 12,
        marginTop: 5,
    }
});

export default NcrCitizenModal; 