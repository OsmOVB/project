import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../styles/global';
import { ResquestFragmentDTO } from '@modules/common/screens/data';

const ModalDetailButchers = ({
  dto,
  visible,
  onClose,
}: {
  dto: ResquestFragmentDTO;
  visible: boolean;
  onClose: () => void;
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setModalOpen(visible);
  }, [visible]);

  const handleClose = () => {
    setModalOpen(false);
    onClose();
  };

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalOpen}
        onRequestClose={handleClose}>
        <View style={styles.modalView} >
          <ScrollView >
            {dto &&
              dto.butchersInsumo.length > 0 &&
              dto.butchersInsumo.map((cul) => (
                <View key={cul.id} style={styles.centerScroll}>
                  <Text style={styles.textBold}>
                    Talhão: {cul.name}
                  </Text>
                  <Text style={styles.textBold}>
                    Cultura: {cul.nmCulture}
                  </Text >
                  {dto &&
                    dto.growcrops.length > 0 &&
                    dto.growcrops.map((grow) => (
                      <View key={grow.cdCultivar} style={styles.centerScroll}>
                        <Text style={styles.textBold}>Cultivar: {grow.nmCultivar}</Text>
                      </View>
                    ))}
                </View>
              ))}
          </ScrollView>

          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={handleClose}>
            <Text style={styles.textStyle}>Fechar</Text>
          </Pressable>
          
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalView: {
    margin: '8%',
    marginTop: '30%',
    marginBottom: '50%',
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    minWidth: 100,
    maxWidth: 110,
    alignSelf: 'center',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centerScroll: {
    padding: 5,
    margin: 5,
  },
  textBold: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export const ModalDetailButcher = React.memo(ModalDetailButchers);