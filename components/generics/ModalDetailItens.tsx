import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { Text } from '@styles/global';
import { MovRequisition } from '@modules/common/screens/data';
import { themes } from '@styles/themes';

const ModalDetailItens = ({
  title,
  disabled,
  dto,
  visible,
  returnOpen,
}: {
  title?: string;
  disabled: boolean;
  dto: MovRequisition;
  visible: boolean;
  returnOpen: (open: boolean) => void;
}) => {
  const [sumAreas, setSumAreas] = useState<number>(0);

  useEffect(() => {
    if (dto && dto.butchers.length > 0) {
      setSumAreas(
        dto.butchers.reduce((total, element) => total + element.vlArea, 0),
      );
    }
  }, [dto]);

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          returnOpen(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView>
              {/* father */}
              <View style={{ padding: '2%' }}>
                {/* Butchers */}
                {dto?.butchers.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.header}>
                      <Text style={styles.headerText}>Talhões</Text>
                    </View>
                    <View style={styles.listContainer}>
                      {dto.butchers.map((but) => (
                        <View key={but.id} style={styles.listItem}>
                          <Text style={styles.boldText}>Talhão:</Text>
                          <Text>{but.name} {' '} {' '}</Text>
                          <Text style={styles.boldText}>Área:</Text>
                          <Text>{but.vlArea}</Text>
                        </View>
                      ))}
                      <View style={styles.totalContainer}>
                        <Text style={styles.boldText}>Total </Text>
                        <Text>{sumAreas.toFixed(2)} ha</Text>
                        <Text> / </Text>
                        <Text>{(sumAreas / 2.42).toFixed(2)} alq</Text>
                      </View>
                    </View>
                  </View>
                )}
                {/* Itens */}
                {dto?.itensInsumos.length > 0 && (
                  <View style={[styles.section, styles.itemSection]}>
                    <View style={styles.header}>
                      <Text style={styles.headerText}>Itens</Text>
                    </View>
                    <View style={styles.listContainer}>
                      {dto.itensInsumos.map((item) => (
                        <View key={item.cdItem} style={styles.listItem}>
                          <Text style={styles.boldText}>Item:</Text>
                          <Text>{item.nmItem} {' '}{' '}</Text>
                          <Text style={styles.boldText}>Qtd:</Text>
                          <Text>
                            {item.qtdItem} {item.dsUnidade}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                returnOpen(false);
              }}>
              <Text style={styles.textStyle}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
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
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    width: '100%',
    marginTop: '5%',
    minWidth: '100%',
  },
  buttonClose: {
    backgroundColor: themes.farmInputs,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    padding: 5,
    backgroundColor: '#878787',
    width: wp('75%'),
    borderRadius: 5,

  },
  header: {
    padding: 5,
    backgroundColor: '#878787',
    borderRadius: 5,
  },
  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContainer: {
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#E7E0DF',
    borderRadius: 5,
    marginBottom: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    
  },
  itemSection: {
    marginTop: 10,
  },
  boldText: {
    fontWeight: 'bold',
    marginRight: 5,
  },
});

export const ModalDetailItem = React.memo(ModalDetailItens);

