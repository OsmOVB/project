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
  selectedFontSize = 24,
  defaultFontSize = 18,
}: WheelProps<T>): React.ReactElement {
  const selectedIndex =
    displayCount % 2 === 0 ? displayCount / 2 - 1 : Math.floor(displayCount / 2);

  const containerHeight = wheelHeight || itemHeight * displayCount;

  const contentPadding =
    containerHeight / 2 - (selectedIndex * itemHeight + itemHeight / 2);

  const circular = values.length >= displayCount;

  const extendedValues: T[] = circular
    ? [
        ...values.slice(-selectedIndex),
        ...values,
        ...values.slice(0, selectedIndex),
      ]
    : values;

  const scrollRef = useRef<ScrollView>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const valueIndex = values.findIndex((v) => v === value);
  const initialIndex = circular ? valueIndex + selectedIndex : valueIndex;

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
    const index = Math.round(offsetY / itemHeight);
    let newIndex = index;

    if (circular) {
      if (index < selectedIndex) {
        newIndex = index + values.length;
        scrollRef.current?.scrollTo({
          y: newIndex * itemHeight,
          animated: false,
        });
      } else if (index >= values.length + selectedIndex) {
        newIndex = index - values.length;
        scrollRef.current?.scrollTo({
          y: newIndex * itemHeight,
          animated: false,
        });
      }
      const originalIndex = (newIndex - selectedIndex + values.length) % values.length;
      if (values[originalIndex] !== value) {
        setValue(values[originalIndex]);
      }
    } else {
      if (values[index] !== value) {
        setValue(values[index]);
      }
    }
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
        decelerationRate="fast"
        onScrollBeginDrag={onScrollBeginDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: contentPadding,
        }}
      >
        {extendedValues.map((item, index) => {
          const itemCenter = index * itemHeight + itemHeight / 2 + contentPadding;
          const visibleCenter = containerHeight / 2;
          const distance = Math.abs(itemCenter - visibleCenter);
          const ratio = Math.min(distance / itemHeight, 1);
          const scale = 1 - ratio * 0.2;

          let isSelected = false;
          if (circular) {
            const originalIndex = (index - selectedIndex + values.length) % values.length;
            isSelected = originalIndex === valueIndex;
          } else {
            isSelected = index === valueIndex;
          }
          const fontSize = isSelected ? selectedFontSize : defaultFontSize;
          return (
            <ItemContainer key={index.toString()} height={itemHeight}>
              <Text
                style={[
                  textStyle,
                  {
                    textAlign: "center",
                    transform: [{ scale }],
                    color: isSelected ? selectedColor : disabledColor,
                    fontSize,
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
