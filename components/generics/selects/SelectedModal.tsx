import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  wbculture,
  wbGrowCrops,
  wbProducer,
  wbPropertyAndHarvest,
  wbWarvestCurent,
} from "@tools/webservice";
import {
  Modal,
  TouchableOpacity,
  View,
  Alert,
  Keyboard,
} from "react-native";
import {FlatList} from 'react-native-gesture-handler'
import {
  Productor,
  Unity,
  Culture,
  GrowCrop,
  Safra,
  Item,
  method,
  ModalType,
} from "@modules/common/screens/data";
import { sortOrder } from "@utils/SortLogic";
import {
  findFields,
  findDistinctPlotsByCropId,
} from "@modules/harvest/database/queries";
import { findCrops } from "@modules/harvest/database/queries/crop";
import { findDrivers } from "@modules/harvest/database/queries/driver";
import { findVehiclesByCarrierId } from "@modules/harvest/database/queries/vehicle";
import { IconButton, Text, TextWrapper } from "@styles/global";
import { Icon } from "@components/Icon";
import { themes } from "@styles/themes";
import { HeaderContainer, InputSearch, Margin } from "./modalSelect/Style";
import { CustomText } from "../CustomText";
import { SnackScreen } from "@components/snackScreen/SnackScreen";

export const SelectedModal = ({
  pushInformation,
  pushOpen,
  open,
  title,
  type,
  method,
  headerBgColor = "#003775",
  listItemColor = "#000",
  cdHarvest,
  cdButcher,
  cdProductor,
  cdProperty,
  cdTransporter,
  cdCulture,
  productors,
}: {
  pushInformation: (data: Item) => void;
  pushOpen: (open: boolean) => void;
  open: boolean;
  title: string;
  type: ModalType;
  method?: method;
  headerBgColor?: string;
  listItemColor?: string;
  cdHarvest?: number | string;
  cdButcher?: number | string;
  cdProductor?: number;
  cdProperty?: number | string;
  cdTransporter?: number;
  cdCulture?: number;
  productors?: Productor[];
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setOpenModal] = useState(false);
  const [valueSearch, setValueSearch] = useState<string>("");
  const [data, setData] = useState<Item[]>([]);

  useEffect(() => {
    setLoading(true);
    setValueSearch("");
    switch (type) {
      case "harvest":
        method
          ? method == "on"
            ? requestHarvestOn()
            : requestCropsOff()
          : requestHarvestOn();
        break;
      case "producer":
        RequestProducer();
        break;
      case "property":
        Requestproperty();
        break;
      case "culture":
        ResquestCulture();
        break;
      case "growCrops":
        RequestGrowCrops();
        break;
      case "place-producer":
        ResquestPlaceProductor();
        break;
      case "butcher":
        requestPlots();
        break;
      case "field":
        requestFields();
        break;
      case "driver":
        requestDrivers();
        break;
      case "vehicle":
        requestVehicles();
        break;
      default:
        setLoading(false);
        break;
    }
  }, [type]);

  useEffect(() => {
    Keyboard.dismiss();
  }, [type]);

  useEffect(() => {
    setOpenModal(open);
  }, [open]);

  const requestHarvestOn = () => {
    axios
      .get(`${wbWarvestCurent}`)
      .then((res) => {
        setData(
          res.data.map((value: Safra) => ({
            id: value.cdSafra,
            name: value.nmSafra,
            cdHarvest: value.cdSafra,
            nmHarvest: value.nmSafra,
          }))
        );
      })
      .finally(() => {
        setLoading(false);
      })
      .catch((ex) => {
        setData([]);
        setLoading(false);
        console.error(ex);
      });
  };

  const requestCropsOff = async () => {
    setLoading(true);
    findCrops()
      .then((res) => {
        setData(res.map(({ id, name }) => ({ id, name })));
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  const requestPlots = () => {
    if (cdHarvest) {
      setLoading(true);
      findDistinctPlotsByCropId(Number(cdHarvest))
        .then((res) => {
          setData(
            res.map(({ id, name }) => ({
              id,
              name,
            }))
          );
        })
        .catch((ex) => {
          setData([]);
          setLoading(false);
          console.error(ex);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const requestFields = () => {
    if (cdHarvest && cdButcher) {
      setLoading(true);
      findFields(Number(cdHarvest), Number(cdButcher))
        .then(async (res) => {
          setData(
            res.map(
              ({
                fieldId,
                plotId,
                siloId,
                cropId,
                sourcePropertyId,
                destinationPropertyId,
                unclassifiedFieldId,
                fieldCropId,
                fieldCropVarietyId,
                ...rest
              }) => ({
                id: Number(
                  fieldId
                    .toString()
                    .concat(plotId.toString())
                    .concat(siloId.toString())
                    .concat(cropId.toString())
                    .concat(sourcePropertyId.toString())
                    .concat(destinationPropertyId.toString())
                    .concat(unclassifiedFieldId.toString())
                    .concat(fieldCropId.toString())
                    .concat(fieldCropVarietyId.toString())
                ),
                name: fieldId.toString(),
                fieldId,
                plotId,
                siloId,
                cropId,
                sourcePropertyId,
                destinationPropertyId,
                unclassifiedFieldId,
                fieldCropId,
                fieldCropVarietyId,
                ...rest,
              })
            )
          );
        })
        .catch((ex) => {
          console.error(ex);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  const requestDrivers = async () => {
    if (cdHarvest && cdButcher) {
      setLoading(true);
      findDrivers()
        .then(async (res) => {
          setData(
            res.map(({ cpf, carrierId, name }) => ({
              id: cpf,
              name,
              driverName: name,
              driverCpf: cpf,
              carrierId,
            }))
          );
        })
        .catch((ex) => {
          console.error("findDrivers error", ex);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  const requestVehicles = () => {
    if (cdTransporter) {
      setLoading(true);
      findVehiclesByCarrierId(cdTransporter)
        .then(async (res) => {
          setData(
            res.map(({ licensePlate, carrierName, carrierId }) => ({
              id: licensePlate,
              name: licensePlate,
              licensePlate,
              carrierName,
              carrierId,
            }))
          );
        })
        .catch((ex) => {
          console.error(ex);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  const Requestproperty = () => {
    if (cdHarvest) {
      axios
        .get(`${wbPropertyAndHarvest}/${cdHarvest}`)
        .then((res) => {
          setData(
            res.data.map((value: Unity) => ({
              id: value.cdPropriedade,
              name: value.nmPropriedade,
            }))
          );
          setLoading(false);
        })
        .catch((ex) => {
          setData([]);
          console.error(ex);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  const RequestProducer = () => {
    if (cdHarvest) {
      axios
        .get(`${wbProducer}/${cdHarvest}`)
        .then((res) => {
          setData(
            res.data.map((value: Productor) => ({
              id: value.cdProdutor,
              name: value.nmProdutor,
              cdProducer: value.cdProdutor,
              nmProducer: value.nmProdutor,
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

  const ResquestCulture = () => {
    if (cdProperty && cdHarvest && cdProductor) {
      setLoading(true);
      axios
        .get(`${wbculture}/${cdProperty}/${cdHarvest}/${cdProductor}`)
        .then((res) => {
          setData(
            res.data.map((value: Culture) => ({
              id: value.cdCultura,
              name: value.nmCultura,
              cdCulture: value.cdCultura,
              nmCulture: value.nmCultura,
            }))
          );
          setLoading(false);
        })
        .catch((ex) => {
          setData([]);
          console.error(ex);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  const ResquestPlaceProductor = () => {
    if (productors && productors.length > 0) {
      setData(productors as []);
      setLoading(false);
    } else {
      setData([]);
      setLoading(false);
      Alert.alert("Não achei produtores");
    }
  };

  const RequestGrowCrops = () => {
    if (cdCulture && cdHarvest && cdProperty) {
      setLoading(true);
      axios
        .get(
          `${wbGrowCrops}/${cdCulture}/${cdHarvest}/${cdProperty}/${cdProductor}`
        )
        .then((res) => {
          setData(
            res.data.map((value: GrowCrop) => ({
              id: value.cdCultivar,
              name: value.nmCultivar,
              cdGrowCrops: value.cdCultivar,
              growCrops: value.nmCultivar,
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

  const filtered = data
    .filter(
      (item) =>
        (item.id && item.id.toString().includes(valueSearch.toUpperCase())) ||
        (item && item.name.includes(valueSearch.toUpperCase()))
    )
    .sort((a, b) => sortOrder(a.name, b.name, true));

  const renderFields = (row: Item) => {
    return (
      <>
        <TextWrapper>Número: {row.name ?? "Sem informação"}</TextWrapper>
        <TextWrapper>
          Tipo Grão:{" "}
          {row.seedKind
            ? row.seedKind == "S"
              ? "Semente"
              : "Consumo"
            : "Sem informação"}
        </TextWrapper>
        <TextWrapper>
          Cultivar: {row.fieldCropVarietyName ?? "Sem informação"}
        </TextWrapper>
        <TextWrapper>
          Cultura: {row.fieldCropId ?? "Sem informação"}
        </TextWrapper>
        <TextWrapper>
          Emitente: {row.sourcePropertyName ?? "Sem informação"}
        </TextWrapper>
        <TextWrapper>
          Destino: {row.destinationPropertyName ?? "Sem informação"}
        </TextWrapper>
        <TextWrapper>
          Produtor: {row.farmProducerName ?? "Sem informação"}
        </TextWrapper>
        <TextWrapper>
          Categoria: {row.categoryName ?? "Sem informação"}
        </TextWrapper>
        <TextWrapper>Silo: {row.siloName ?? "Sem informação"}</TextWrapper>
      </>
    );
  };

  const renderDriver = (row: Item) => {
    return <Text>Nome: {row.name ?? "Sem informação"}</Text>;
  };

  const renderVehicle = (row: Item) => {
    return (
      <>
        <Text>Placa: {row.name ?? "Sem informação"}</Text>
        <Text>Transportadora: {row.carrierName ?? "Sem informação"}</Text>
      </>
    );
  };

  const renderGenerals = (row: Item) => {
    return (
      <>
        <Text
          style={{
            fontWeight: "bold",
            marginBottom: "2%",
            flexWrap: "wrap",
          }}
        >
          Código: {row.id ?? "Sem informação"}
        </Text>
        <Text style={{ flexWrap: "wrap", width: "80%" }}>
          Nome: {row.name ?? "Sem informação"}
        </Text>
      </>
    );
  };

  const renderItem = (row: Item) => {
    return (
      <TouchableOpacity
        onPress={() => {
          pushInformation(row);
        }}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 8,
          borderBottomWidth: 1,
          borderBottomColor: "#ccc",
          flex: 1,
        }}
      >
        <View style={{ width: "80%" }}>
          {type == "harvest" || type == "butcher"
            ? renderGenerals(row)
            : type == "property"
            ? renderGenerals(row)
            : type == "producer"
            ? renderGenerals(row)
            : type == "place-producer"
            ? renderGenerals(row)
            : type == "driver"
            ? renderDriver(row)
            : type == "vehicle"
            ? renderVehicle(row)
            : renderFields(row)}
        </View>
        <Icon
          name={
            type == "harvest"
              ? "harvest"
              : type == "producer"
              ? "combineHarvester"
              : type == "property"
              ? "local"
              : type == "culture"
              ? "fertilizerBag"
              : type == "growCrops"
              ? "farmer"
              : type == "place-producer"
              ? "groupFarm"
              : type == "butcher"
              ? "plot"
              : "handPointLeft"
          }
          color={listItemColor}
          size={40}
        />
      </TouchableOpacity>
    );
  };

  return (
    <>
      {!loading && (
        <Modal
          accessible
          focusable
          onShow={() => Keyboard.dismiss()}
          animationType="slide"
          transparent={false}
          visible={modalOpen}
        >
          <HeaderContainer color={headerBgColor}>
            <Text></Text>
            <CustomText color="#fff">{title.toUpperCase()}</CustomText>
            <IconButton
              backgroundColor="#FFF"
              borderRadius={4}
              padding={4}
              onPress={() => {
                setOpenModal(false);
                pushOpen(false);
              }}
            >
              <Icon name="close" size={20} color={headerBgColor} />
            </IconButton>
          </HeaderContainer>
          <Margin>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                padding: "2%",
                borderWidth: 1,
                borderColor: themes.harvest,
                borderRadius: 5,
                display: "flex",
              }}
            >
              <InputSearch
                placeholder="Pesquisar..."
                placeholderTextColor={"#424242"}
                value={valueSearch}
                onChangeText={(search) => setValueSearch(search)}
              />
              <Icon name="search" color="black" size={25} />
            </View>
            <FlatList
              nestedScrollEnabled
              data={filtered}
              keyExtractor={(item, index) => item.id.toString() + index}
              renderItem={({ item: row }) => renderItem(row)}
              ListEmptyComponent={
                <SnackScreen
                  imgtype="Empty"
                  textHeader="Informações não Encontradas"
                  textParagraph={`Não foi possível encontrar informações!`}
                />
              }
            />
          </Margin>
        </Modal>
      )}
    </>
  );
};
