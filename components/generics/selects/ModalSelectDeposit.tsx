import React, { useEffect, useState } from 'react';
import { Modal, TouchableOpacity, View, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { SpaceBetweenContainer, Text, BoldText } from '@styles/global';
import { findAllMovement } from '@database/controllers/typeMovement';
import { themes } from '@styles/themes';
import { TypeMovement } from '@modules/common/screens/data';
import { CloseIcon, HandPointLeftIcon, SearchIcon } from '@assets/icons';

const ModalSelectDeposits = ({
  pushInformation,
  pushOpen,
  open,
  title,
}: {
  pushInformation: (data: TypeMovement) => void;
  pushOpen: (open: boolean) => void;
  open: boolean;
  title: string;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [valueSearch, setValueSearch] = useState<string>('');
  const [data, setData] = useState<TypeMovement[]>([]);

  useEffect(() => {
    setLoading(true);
    setValueSearch('');
    findAllSapiensMovement();
  }, []);

  const findAllSapiensMovement = () => {
    findAllMovement()
      .then((res) => {
        setLoading(false);
        setData(res as TypeMovement[]);
      })
      .catch((ex) => {
        setLoading(false);
        console.error(ex);
      });
  };

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  const filtered = data.filter(
    (item) =>
      item.ID_MOVIMENTO_SAPIENS?.toString().includes(valueSearch.toUpperCase()) ||
      item.NM_EMP_MOVIMENTO?.includes(valueSearch.toUpperCase())
  );

  return (
    <>
      {loading && (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ marginBottom: '50%' }}>
            <ActivityIndicator size="large" />
            <Text>CARREGANDO...</Text>
          </View>
        </View>
      )}
      {!loading && (
        <Modal animationType="slide" transparent={false} visible={modalOpen}>
          <SpaceBetweenContainer
            style={{
              display: 'flex',
              padding: 16,
              backgroundColor: themes.garage,
            }}
          >
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: 18,
              }}
            >
              {title.toUpperCase()}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setModalOpen(false);
                pushOpen(false);
              }}
            >
              <CloseIcon size={30} color="#FFF" />
            </TouchableOpacity>
          </SpaceBetweenContainer>
          <ScrollView
            contentContainerStyle={{
              padding: '3%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: '2%',
                borderWidth: 1,
                borderColor: 'black',
                borderRadius: 5,
                backgroundColor: 'white',
                marginBottom: 16,
              }}
            >
              <TextInput
                maxLength={40}
                placeholder="Pesquisar..."
                value={valueSearch}
                onChangeText={(search) => setValueSearch(search)}
                autoCorrect={false}
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor: '#fff',
                  color: '#424242',
                }}
                underlineColorAndroid="transparent"
              />
              <SearchIcon size={25} />
            </View>
            {filtered.map((row) => (
              <TouchableOpacity
                key={`${row.ID_MOVIMENTO_SAPIENS}-${row.NM_EMP_MOVIMENTO}`}
                onPress={() => {
                  pushInformation(row);
                }}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ddd',
                }}
              >
                <View>
                  <BoldText>
                    Código: {row.ID_MOVIMENTO_SAPIENS || 'Sem informação'}
                  </BoldText>
                  <Text>
                    Nome: {row.NM_EMP_MOVIMENTO || 'Sem informação'}
                  </Text>
                  <Text>
                    Descrição: {'Sem informação'}
                  </Text>
                </View>
                <HandPointLeftIcon size={40} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Modal>
      )}
    </>
  );
};

export const ModalSelectDeposit = React.memo(ModalSelectDeposits);

