import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewStyle,
  TextStyle,
  Text,
  View,
} from "react-native";
import styled from "styled-components/native";

export interface WheelStyleProps {
  containerStyle?: ViewStyle;
  itemHeight?: number;
  selectedColor?: string;
  disabledColor?: string;
  textStyle?: TextStyle;
  wheelHeight?: number;
  displayCount?: number;
  punctuation?: string;
  selectedFontSize?: number;
  defaultFontSize?: number;
}

export interface WheelProps<T> extends WheelStyleProps {
  value: T;
  setValue: (value: T) => void;
  values: T[];
  onScroll?: (scrollState: boolean) => void;
}

const Container = styled.View`
  overflow: hidden;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const CenterIndicator = styled.View<{ top: number; itemHeight: number }>`
  position: absolute;
  top: ${({ top }) => top}px;
  left: 0;
  right: 0;
  height: ${({ itemHeight }) => itemHeight}px;
  border-top-width: 2px;
  border-bottom-width: 2px;
  border-color: rgba(0, 0, 0, 0.2);
  pointer-events: none;
`;

const ItemContainer = styled.View<{ height: number }>`
  height: ${({ height }) => height}px;
  justify-content: center;
  align-items: center;
`;

function Wheel<T>({
  value,
  setValue,
  onScroll,
  values,
  containerStyle,
  textStyle,
  itemHeight = 50,
  selectedColor = "black",
  disabledColor = "gray",
  wheelHeight,
  displayCount = 5,
  punctuation = "",
  selectedFontSize = 22,
  defaultFontSize = 18,
}: WheelProps<T>): React.ReactElement {
  const selectedIndex = Math.floor(displayCount / 2);
  const containerHeight = wheelHeight || itemHeight * displayCount;
  const contentPadding = containerHeight / 2 - (selectedIndex * itemHeight + itemHeight / 2);

  // 🔄 Criamos um loop infinito da lista
  const extendedValues: T[] = [...values, ...values, ...values];

  const scrollRef = useRef<ScrollView>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  // 🔹 Define a posição inicial no meio da lista para evitar travamento
  const valueIndex = values.findIndex((v) => v === value);
  const initialIndex = valueIndex + values.length;

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: initialIndex * itemHeight,
        animated: false,
      });
    }, 0);
  }, [initialIndex, itemHeight]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setScrollOffset(event.nativeEvent.contentOffset.y);
    },
    []
  );

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    let index = Math.round(offsetY / itemHeight);

    // 🔄 Reseta o scroll para o meio quando chega ao topo ou fundo
    if (index < values.length) {
      index += values.length;
      scrollRef.current?.scrollTo({ y: index * itemHeight, animated: false });
    } else if (index >= values.length * 2) {
      index -= values.length;
      scrollRef.current?.scrollTo({ y: index * itemHeight, animated: false });
    }

    // Ajusta o índice corretamente para obter o valor selecionado
    const newIndex = index % values.length;
    setValue(values[newIndex]);
    onScroll && onScroll(false);
  };

  const onScrollBeginDrag = () => {
    onScroll && onScroll(true);
  };

  const centerIndicatorTop = (containerHeight - itemHeight) / 2;

  return (
    <Container style={[{ height: containerHeight }, containerStyle]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="normal"
        onScrollBeginDrag={onScrollBeginDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={handleScroll}
        scrollEventThrottle={12}
        contentContainerStyle={{
          paddingVertical: contentPadding,
        }}
      >
        {extendedValues.map((item, index) => {
          const itemCenter = index * itemHeight + itemHeight / 2 + contentPadding;
          const visibleCenter = containerHeight / 2;
          const distance = Math.abs(itemCenter - visibleCenter);
          const ratio = Math.min(distance / itemHeight, 1);
          const scale = 1 - ratio * 0.1;

          const isSelected = index % values.length === valueIndex;

          return (
            <ItemContainer key={index.toString()} height={itemHeight}>
              <Text
                style={[
                  textStyle,
                  {
                    textAlign: "center",
                    transform: [{ scale }],
                    color: isSelected ? selectedColor : disabledColor,
                    fontSize: isSelected ? selectedFontSize : defaultFontSize,
                  },
                ]}
              >
                {isSelected && punctuation
                  ? `${String(item)}${punctuation}`
                  : String(item)}
              </Text>
            </ItemContainer>
          );
        })}
      </ScrollView>
      <CenterIndicator top={centerIndicatorTop} itemHeight={itemHeight} />
    </Container>
  );
}

export default Wheel;
