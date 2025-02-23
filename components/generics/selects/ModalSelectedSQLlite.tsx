import React, { useEffect, useState } from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { findAllSubsidiary } from "@database/controllers/subsidiary";
import { SpaceBetweenContainer, Text } from "@styles/global";
import { themes } from "@styles/themes";
import { sortOrder } from "@utils/SortLogic";
import { Item } from "@modules/common/screens/data";
import { CloseIcon, HandPointLeftIcon, SearchIcon } from "@assets/icons";

const ModalSelectedSQLlites = ({
  pushInformation,
  callBack,
  open,
  title,
  type,
}: {
  pushInformation: (data: Item) => void;
  callBack: (open: boolean) => void;
  open: boolean;
  title: string;
  type: string;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [valueSearch, setValueSearch] = useState<string>("");
  const [filiais, setFiliais] = useState<Item[]>([]);

  useEffect(() => {
    setLoading(true);
    setValueSearch("");

    switch (type) {
      case "property":
        Requestproperty();
        break;
      default:
        setLoading(false);
        break;
    }
  }, [type]);

  useEffect(() => {
    Keyboard.dismiss();
  }, [type]);

  const Requestproperty = () => {
    setLoading(true);
    findAllSubsidiary()
      .then((res) => {
        setFiliais(
          res.map((value: any) => ({
            id: value.CD_FILIAL,
            name: value.NM_PROPRIEDADE,
          }))
        );
        setLoading(false);
      })
      .catch((error) => {
        console.error("Requestproperty error: ", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  const filtered = filiais
    .filter(
      (item) =>
        (item.id && item.id.toString().includes(valueSearch.toUpperCase())) ||
        (item && item.name && item.name.includes(valueSearch.toUpperCase()))
    )
    .sort((a, b) => sortOrder(a.name, b.name, true));

  return (
    <Modal
      accessible
      focusable
      onShow={() => {
        Keyboard.dismiss();
      }}
      animationType="slide"
      transparent={false}
      visible={modalOpen}
    >
      <SpaceBetweenContainer
        style={{
          display: "flex",
          padding: 16,
          backgroundColor: themes.garage,
        }}
      >
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          {title.toUpperCase()}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setModalOpen(false);
            callBack(false);
          }}
        >
          <CloseIcon color="white" size={30}/>
        </TouchableOpacity>
      </SpaceBetweenContainer>
      <View
        style={{
          margin: "3%",
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding: "5%",
            borderWidth: 1,
            borderColor: "black",
            borderRadius: 5,
            backgroundColor: "white",
            display: "flex",
            width: "100%",
          }}
        >
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
              paddingLeft: 10,
              backgroundColor: "#fff",
              color: "#000",
            }}
            underlineColorAndroid="transparent"
          />
          <SearchIcon size={25} />
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#003775" />
        ) : (
          <ScrollView>
            {filtered.map((row) => (
              <TouchableOpacity
                key={row.id}
                onPress={() => {
                  pushInformation(row);
                  setModalOpen(false);
                  callBack(false);
                }}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 10,
                  marginTop: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: "#ccc",
                }}
              >
                <View>
                  <Text style={{ fontWeight: "bold", marginBottom: "1%" }}>
                    Código: {row.id ? row.id : "Sem informação"}
                  </Text>
                  <Text>Nome: {row.name ? row.name : "Sem informação"}</Text>
                  <Text>Descrição: {"Sem informação"}</Text>
                </View>
                <HandPointLeftIcon size={40} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export const ModalSelectedSQLlite = React.memo(ModalSelectedSQLlites);
