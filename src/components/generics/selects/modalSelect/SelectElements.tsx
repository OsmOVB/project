import React, { useState, useEffect, useCallback } from "react";
import {
  Keyboard,
  Modal,
  View,
  ListRenderItemInfo,
  StyleSheet,
} from "react-native";
import {FlatList} from 'react-native-gesture-handler'
import {
  AlignContainer,
  ChoiceContainer,
  ListItemSeparator,
  IconButton,
  Text,
} from "@styles/global";
import { sortOrder } from "@utils/SortLogic";
import {
  BottomContainer,
  CenteredBottom,
  HeaderContainer,
  Margin,
  RowView,
} from "./Style";

import { CancelButton } from "@buttons/CancelButton";
import { ConfirmButton } from "@buttons/ConfirmButton";
import { Checkbox } from "@modules/mechanics/screens/garage/check/checkBox";
import { Icon } from "@components/Icon";
import { SnackScreen } from "@components/snackScreen/SnackScreen";
import { IconName } from "@components/Icon/types";
import { CustomText } from "@components/generics/CustomText";
import QRCodeScanner from "react-native-qrcode-scanner";
import { CloseButton } from "@components/CloseButton";
import { BarCodeReadEvent } from "react-native-camera";
import { InputOptionalButton } from "@components/generics/input/InputOptionalButton";
const ItemSeparator = () => (
  <ListItemSeparator spacing={1} backgroundColor="#737373" />
);
export interface SelectElementProps<T> {
  title?: string;
  items: T[];
  itemIcon?: IconName;
  itemIconSize?: number;
  itemIconColor?: string;
  visible: boolean;
  headerBgColor: string;
  emptyListMessage?: string;
  itemLabel?: string;
  removeButtonClose?: boolean;
  onValueChange?: (value: T | null) => void;
  onValueChangeItems?: (value: T[]) => void;
  labelExtractor?: (item: T) => string;
  valueExtractor: (item: T) => string;
  onClosed?: () => void;
  qrCode?: boolean;
  goBack?: () => void;
  goBackOnClose?: boolean;
  isOptional?: boolean;
  optionalBackgroundColor?: string;
}

export function SelectElements<T>({
  title = "Selecione uma opção",
  items,
  itemIcon = "handPointLeft",
  itemIconSize = 40,
  itemIconColor = "#000",
  itemLabel = "Descrição",
  visible,
  headerBgColor,
  emptyListMessage,
  removeButtonClose = false,
  onValueChange,
  onValueChangeItems,
  labelExtractor,
  valueExtractor,
  onClosed,
  qrCode,
  goBack,
  goBackOnClose = false,
  isOptional,
  optionalBackgroundColor,
}: Readonly<SelectElementProps<T>>) {
  const [valueSearch, setValueSearch] = useState<string>("");
  const [visibleState, setVisibleState] = useState(false);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [paginatedItems, setPaginatedItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [isScanningQRCode, setIsScanningQRCode] = useState(false);
  const PAGE_SIZE = 12;

  useEffect(() => {
    setVisibleState(visible);
    if (visible) {
      loadInitialItems(items);
    } else {
      resetState();
    }
  }, [visible, items]);

  useEffect(() => {
    if (valueSearch === "") {
      loadInitialItems(items);
    } else {
      filterItems();
    }
  }, [valueSearch, items]);

  const filterItems = () => {
    setCurrentPage(1);
    const filtered = items.filter(
      (item) =>
        valueExtractor(item)
          ?.toUpperCase()
          ?.includes(valueSearch.toUpperCase()) ||
        labelExtractor?.(item)
          ?.toUpperCase()
          ?.includes(valueSearch.toUpperCase())
    );
    setFilteredItems(filtered);
    setPaginatedItems(filtered.slice(0, PAGE_SIZE));
  };

  const handleSelectItem = useCallback(
    (item: T | null) => {
      if (!onValueChange) return;
      onValueChange(item);
      if (onClosed) {
        onClosed();
      }
    },
    [onValueChange, onClosed]
  );

  const handleSelectItems = useCallback(
    (item: T) => {
      if (!onValueChangeItems) return;
      const index = selectedItems.findIndex(
        (selectedItem) => valueExtractor(selectedItem) === valueExtractor(item)
      );
      if (index === -1) {
        setSelectedItems((prev) => [...prev, item]);
      } else {
        setSelectedItems((prev) =>
          prev.filter(
            (selectedItem) =>
              valueExtractor(selectedItem) !== valueExtractor(item)
          )
        );
      }
    },
    [selectedItems]
  );

  const handleClean = useCallback(() => {
    if (goBackOnClose && goBack) {
      goBack();
    } else {
      //onClose exists?
      if (onClosed) {
        onClosed();
      }
    }
    resetState();
  }, [onClosed, goBack, goBackOnClose]);

  const loadInitialItems = (items: T[]) => {
    const sortedItems = [...items].sort((a, b) => {
      const codeA = valueExtractor(a).padStart(5, "0");
      const codeB = valueExtractor(b).padStart(5, "0");
      return sortOrder(codeA, codeB, false);
    });
    setFilteredItems(sortedItems);
    setPaginatedItems(sortedItems.slice(0, PAGE_SIZE));
    setCurrentPage(1);
  };

  const loadMoreItems = useCallback(() => {
    if (!isFetching && paginatedItems.length < filteredItems.length) {
      setIsFetching(true);
      setCurrentPage((prevPage) => {
        const nextPage = prevPage + 1;
        const newItems = filteredItems.slice(0, nextPage * PAGE_SIZE);
        setPaginatedItems(newItems);
        setIsFetching(false);
        return nextPage;
      });
    }
  }, [paginatedItems, filteredItems]);

  const handleReadQRCode = ({ data: machineId }: BarCodeReadEvent) => {
    setValueSearch(machineId);
    setIsScanningQRCode(false);
  };

  const resetState = () => {
    setSelectedItems([]);
    setPaginatedItems([]);
    setCurrentPage(0);
    setValueSearch("");
  };

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<T>) => (
      <MemoizedItem
        item={item}
        handleSelectItem={handleSelectItem}
        handleSelectItems={handleSelectItems}
        selectedItems={selectedItems}
        valueExtractor={valueExtractor}
        labelExtractor={labelExtractor}
        itemLabel={itemLabel}
        itemIcon={itemIcon}
        itemIconSize={itemIconSize}
        itemIconColor={itemIconColor}
        headerBgColor={headerBgColor}
        onValueChangeItems={onValueChangeItems}
      />
    ),
    [selectedItems]
  );

  const selectionItems = onValueChangeItems && selectedItems.length > 0 && (
    <BottomContainer>
      <CancelButton
        label="Limpar"
        width="40%"
        borderColor={headerBgColor}
        textColor={headerBgColor}
        onPress={() => setSelectedItems([])}
      />
      <ConfirmButton
        backgroundColor={headerBgColor}
        width="40%"
        label="Confirmar"
        onPress={() => {
          onValueChangeItems(selectedItems);
          if (onClosed) {
            onClosed();
          }
        }}
      />
    </BottomContainer>
  );

  return isScanningQRCode ? (
    <View style={styles.fullScreen}>
      <QRCodeScanner
        onRead={handleReadQRCode}
        cameraType="back"
        reactivate
        reactivateTimeout={2000}
        showMarker
        markerStyle={{ ...styles.markerStyle }}
        cameraStyle={{ ...styles.cameraExpanded }}
      />
      <CloseButton
        position="absolute"
        top={20}
        right={5}
        onPress={() => setIsScanningQRCode(false)}
      />
    </View>
  ) : (
    <Modal
      accessible
      focusable
      onShow={() => Keyboard.dismiss()}
      animationType="slide"
      transparent={false}
      visible={visibleState}
    >
      <HeaderContainer color={headerBgColor}>
        <Text></Text>
        <CustomText color="#fff">{title.toUpperCase()}</CustomText>
        {!removeButtonClose ? (
          <IconButton
            backgroundColor="#FFF"
            borderRadius={4}
            padding={4}
            onPress={goBack ? goBack : handleClean}
          >
            <Icon name="close" size={20} color={headerBgColor} />
          </IconButton>
        ) : (
          <View />
        )}
      </HeaderContainer>
      <Margin>
        {!qrCode ? (
          <InputOptionalButton
            maskType="none"
            placeholder="Pesquisar..."
            color={headerBgColor}
            iconName="magnifyingGlass"
            value={valueSearch}
            onChangeText={(search) => setValueSearch(search)}
            onPressButton={() => {}}
          />
        ) : (
          <View style={{ flexDirection: "row" }}>
            <InputOptionalButton
              maskType="none"
              placeholder="Pesquisar..."
              color={headerBgColor}
              iconName="qrCode"
              value={valueSearch}
              onChangeText={(search) => setValueSearch(search)}
              onPressButton={() => {
                setIsScanningQRCode(true);
              }}
            />
          </View>
        )}
        <FlatList
          nestedScrollEnabled
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={
            <SnackScreen
              imgtype="Empty"
              textHeader="Informações não Encontradas"
              textParagraph={emptyListMessage}
            />
          }
          data={paginatedItems}
          renderItem={renderItem}
          keyExtractor={valueExtractor}
          onEndReached={loadMoreItems}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={true}
        />
        {isOptional && (
          <CenteredBottom>
            <ConfirmButton
              backgroundColor={optionalBackgroundColor}
              width="45%"
              onPress={() => handleSelectItem(null)}
            />
          </CenteredBottom>
        )}
      </Margin>
      {selectionItems}
    </Modal>
  );
}

const MemoizedItem = React.memo(
  ({
    item,
    handleSelectItem,
    handleSelectItems,
    selectedItems,
    valueExtractor,
    labelExtractor,
    itemLabel,
    itemIcon,
    itemIconSize,
    itemIconColor,
    headerBgColor,
    onValueChangeItems,
  }: {
    item: any;
    handleSelectItem: (item: any) => void;
    handleSelectItems: (item: any) => void;
    selectedItems: any[];
    valueExtractor: (item: any) => string;
    labelExtractor?: (item: any) => string;
    itemLabel?: string;
    itemIcon: IconName;
    itemIconSize: number;
    itemIconColor: string;
    headerBgColor?: string;
    onValueChangeItems?: (value: any[]) => void;
  }) => {
    return (
      <RowView>
        <ChoiceContainer
          marginVertical="3%"
          onPress={onValueChangeItems ? () => {} : () => handleSelectItem(item)}
        >
          <AlignContainer alignItems="flex-start">
            <View style={{ flexDirection: "row" }}>
              {onValueChangeItems && (
                <View style={{ marginRight: 10, justifyContent: "center" }}>
                  <Checkbox
                    color={headerBgColor}
                    label={""}
                    onChange={() => handleSelectItems(item)}
                    isChecked={selectedItems.some(
                      (selectedItem) =>
                        valueExtractor(selectedItem) === valueExtractor(item)
                    )}
                    size={30}
                  />
                </View>
              )}
              <View>
                <Text>Código: {item ? valueExtractor(item) : ""}</Text>
                {labelExtractor && (
                  <Text>
                    {itemLabel}: {item ? labelExtractor(item) : ""}
                  </Text>
                )}
              </View>
            </View>
          </AlignContainer>
          <AlignContainer alignItems="flex-end">
            <Icon name={itemIcon} size={itemIconSize} color={itemIconColor} />
          </AlignContainer>
        </ChoiceContainer>
      </RowView>
    );
  }
);

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraExpanded: {
    position: "absolute",
    width: "100%",
    height: "100%",
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  markerStyle: {
    borderColor: "#FFF",
    borderRadius: 10,
    borderWidth: 2,
  },
});
