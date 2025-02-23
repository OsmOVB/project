import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, TouchableOpacity, Text, View, TextInput, ToastAndroid, ScrollView, ActivityIndicator } from 'react-native';
import { wbDriverInfos } from '@tools/webservice';
import { Driver } from '../../../types/database/entities';
import { themes } from '@styles/themes';
import NetworkStatus from '@hooks/useNetworkStatus';
import { CloseIcon, HandPointLeftIcon, SearchIcon } from '@assets/icons';

const ModalSelectDrivers = ({
  pushInformation,
  pushOpen,
  open,
  title,
}: {
  pushInformation: (data: Driver) => void;
  pushOpen: (open: boolean) => void;
  open: boolean;
  title: string;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [valueSearch, setValueSearch] = useState<string>('');
  const [data, setData] = useState<Driver[]>([]);

  useEffect(() => {
    setValueSearch('');
  }, []);

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  const requestDriver = async () => {
    let state = await NetworkStatus();
    if (state.isCompanyNetwork) {
      setLoading(true);
      axios.get(`${wbDriverInfos}/${valueSearch}`)
        .then(({ data }) => {
          if (data.length > 0) {
            setData(data);
          }
        })
        .catch((error) => {
          console.error("requestDriver error", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      ToastAndroid.show(
        'Sem internet, Realize a conexão...',
        ToastAndroid.LONG,
      );
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <View style={{ marginBottom: '50%' }}>
            <ActivityIndicator size="large" color={themes.garage} />
            <Text>CARREGANDO...</Text>
          </View>
        </View>
      )}
      {!loading && (
        <Modal animationType="slide" transparent={false} visible={modalOpen}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: themes.garage }}>
            <Text></Text>
            <Text style={{ marginTop: '2%', marginLeft: '2%', color: 'white' }}>
              {title.toUpperCase()}
            </Text>
            <TouchableOpacity
              style={{ marginTop: '2%' }}
              onPress={() => {
                setModalOpen(false);
                pushOpen(false);
              }}>
              <CloseIcon color="white" size={30}/>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ margin: '3%' }}>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2%',
                marginLeft: '1%',
                borderWidth: 1,
                borderColor: 'black',
                borderRadius: 5,
                backgroundColor: 'white',
                width: '100%',
              }}>
                <TextInput
                  maxLength={40}
                  placeholder="Pesquisar..."
                  placeholderTextColor={"#424242"}
                  value={valueSearch}
                  onChangeText={(search) => setValueSearch(search)}
                  autoCorrect={false}
                  style={{
                    flex: 1,
                    paddingTop: 10,
                    paddingRight: 10,
                    paddingBottom: 10,
                    paddingLeft: 0,
                    backgroundColor: '#fff',
                    color: '#424242',
                  }}
                  underlineColorAndroid="transparent"
                />
              </View>
              <TouchableOpacity
                style={{
                  width: '15%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: "#808080",
                  marginLeft: "1%",
                  borderWidth: 1,
                  borderColor: "thistle",
                  borderRadius: 50,
                }}
                onPress={() => {
                  if (valueSearch !== '') {
                    requestDriver();
                  } else {
                    ToastAndroid.show(
                      'Valor de pesquisa vazio, informe um nome',
                      ToastAndroid.LONG,
                    );
                  }
                }}>
                <SearchIcon size={25} color='#FFF'/>
              </TouchableOpacity>
            </View>
            <View>
              {data.map((row) => (
                <TouchableOpacity
                  key={`${row.cpf}-${row.name}-${row.carrierId}-${Math.random()}`}
                  onPress={() => {
                    pushInformation(row);
                  }}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 15,
                    paddingHorizontal: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ddd',
                  }}>
                  <View>
                    <Text>
                      <Text style={{ fontWeight: 'bold' }}>Código:</Text>{' '}
                      <Text>{row.cpf || 'Sem informação'}</Text>
                    </Text>
                    <Text>
                      <Text style={{ fontWeight: 'bold', color:'black' }}>Nome:</Text>{' '}
                      <Text style={{color: 'black'}}>{row.name || 'Sem informação'}</Text>
                    </Text>
                  </View>
                  <HandPointLeftIcon size={40} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Modal>
      )}
    </>
  );
};

export const ModalSelectDriver = React.memo(ModalSelectDrivers);