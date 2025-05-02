import React, { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import {
  Modal,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,  
} from "react-native";
import {FlatList} from 'react-native-gesture-handler'
import { sortOrder } from "@utils/SortLogic";
import {
  typeModelITem,
  GroupItem,
  ItensInsumo,
  Item,
} from "@modules/common/screens/data";
import {
  Text,
  FlexContainer,
  SpaceBetweenContainer,
  BoldText,
} from "@styles/global";
import { wbGroupItens, wbItens } from "@tools/webservice";
import { themes } from "@styles/themes";
import { HeaderText } from "@components/table/GenericTable/styles";
import { Icon } from "@components/Icon";

const ModalSelectItems = ({
  color,
  pushInformation,
  pushOpen,
  open,
  title,
  type,
  cdGroup,
  cdCulture,
  iconList = <Icon name="handPointLeft" size={40} color={color ?? "black"} />,
}: {
  color?: string;
  iconList?: ReactNode;
  pushInformation: (data: Item) => void;
  pushOpen: (open: boolean) => void;
  open: boolean;
  title: string;
  type: typeModelITem;
  cdGroup?: number;
  cdCulture?: number;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setOpenModal] = useState(false);
  const [valueSearch, setValueSearch] = useState<string>("");
  const [data, setData] = useState<Item[]>([]);

  useEffect(() => {
    setLoading(true);
    setValueSearch("");

    switch (type) {
      case "group":
        RequestGroupItens();
        break;
      case "item":
        RequestItems();
        break;
      default:
        setLoading(false);
        break;
    }
  }, [type]);

  const RequestItems = () => {
    if (cdCulture && cdGroup) {
      axios
        .get(`${wbItens}/${cdCulture}/${cdGroup}`)
        .then((res) => {
          setData(
            res.data.map((value: ItensInsumo) => ({
              id: value.cdItem,
              name: value.nmItem,
              dsUnidade: value.dsUnidade,
            }))
          );
          setLoading(false);
        })
        .catch((ex) => {
          setData([]);
          setLoading(false);
          console.error(ex);
        });
    } else {
      setLoading(false);
    }
  };

  const RequestGroupItens = () => {
    axios
      .get(`${wbGroupItens}`)
      .then((res) => {
        setData(
          res.data.map((value: GroupItem) => ({
            id: value.cdItemGrupo,
            name: value.nmItemGrupo,
          }))
        );
        setLoading(false);
      })
      .catch((ex) => {
        setData([]);
        setLoading(false);
        console.error(ex);
      });
  };

  useEffect(() => {
    setOpenModal(open);
  }, [open]);

  const filtered = data
    .filter(
      (item) =>
        (item.id && item.id.toString().includes(valueSearch.toUpperCase())) ||
        (item.name && item.name.includes(valueSearch.toUpperCase()))
    )
    .sort((a, b) => sortOrder(a.name, b.name, true));

  const items = (item: Item) => {
    return (
      <TouchableOpacity
        onPress={() => {
          pushInformation(item);
        }}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#ddd",
        }}
      >
        <View>
          <BoldText>Código: {item.id ? item.id : "Sem informação"}</BoldText>
          <Text>Nome: {item.name ? item.name : "Sem informação"}</Text>
          {type === "item" && item.dsUnidade && (
            <Text>Unidade: {item.dsUnidade}</Text>
          )}
        </View>
        {iconList}
      </TouchableOpacity>
    );
  };
  return (
    <>
      {loading && (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
          <BoldText>CARREGANDO...</BoldText>
        </View>
      )}
      {!loading && (
        <Modal animationType="slide" transparent={false} visible={modalOpen}>
          <SpaceBetweenContainer
            style={{
              display: "flex",
              padding: 10,
              backgroundColor: color ?? themes.garage,
              height: 50,
            }}
          >
            <HeaderText
              style={{
                flex: 1,
                textAlign: "center",
                color: "white",
                fontSize: 20,
              }}
            >
              {title}
            </HeaderText>
            <TouchableOpacity
              onPress={() => {
                setOpenModal(false);
                pushOpen(false);
              }}
            >
              <Icon name="close" size={28} color="white" />
            </TouchableOpacity>
          </SpaceBetweenContainer>

          <FlexContainer
            style={{
              padding: 16,
              flex: 1,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: "black",
                borderRadius: 5,
                backgroundColor: "white",
                width: "100%",
              }}
            >
              <TextInput
                maxLength={40}
                placeholder="Pesquisar..."
                placeholderTextColor="#424242"
                value={valueSearch}
                onChangeText={(search) => setValueSearch(search)}
                autoCorrect={false}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 0,
                  backgroundColor: "#fff",
                  color: "#424242",
                }}
                underlineColorAndroid="transparent"
              />
              <Icon name="search" size={28} color={color ?? "black"} />
            </View>
            <FlatList
              nestedScrollEnabled
              style={{ }}
              data={filtered}
              keyExtractor={(item, index) => item.id.toString()+index}
              renderItem={({ item }) => items(item)}
            />
          </FlexContainer>
        </Modal>
      )}
    </>
  );
};

export const ModalSelectItem = React.memo(ModalSelectItems);
