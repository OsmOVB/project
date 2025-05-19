import { Icon } from "@components/Icon";
import { IconName } from "@components/Icon/types";
import { Button } from "@styles/global";
import { View, TouchableOpacity, TextInput } from "react-native";
import styled from "styled-components/native";

interface BaseProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  maskType?: "none" | "decimal" | "currency" | "textArea";
  onTouchStart?: () => void;
  onBlur?: () => void;
}

interface PropsWithButton extends BaseProps {
  onPressButton?: () => void;
  color: string;
  iconName: IconName;
  numberOfLines?: never;
  multiline?: never;
  maxLength?: never;
}

interface PropsWithoutButton extends BaseProps {
  onPressButton?: never;
  color?: never;
  iconName?: never;
  numberOfLines?: number;
  multiline?: boolean;
  maxLength?: number;
}

interface PropsTouchStart extends BaseProps {
  onTouchStart: () => void;
  onPressButton?: never;
  color?: never;
  iconName?: never;
  numberOfLines?: never;
  multiline?: never;
  maxLength?: never;
}

type InputWithIconProps =
  | PropsWithButton
  | PropsWithoutButton
  | PropsTouchStart;

const formatValue = (value?: string, maskType?: string): string => {
  if (!value) return "";
  switch (maskType) {
    case "decimal":
      return value
        .replace(/[^0-9.]/g, "")
        .replace(/(\.\d{2}).*$/, "$1")
        .replace(/\.(?=.*\.)/g, "");
    case "currency":
      let numericValue = value.replace(/[^0-9]/g, "");
      if (!numericValue) return "R$ 0,00";
      return (parseFloat(numericValue) / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    default:
      return value;
  }
};

export const InputOptionalButton: React.FC<InputWithIconProps> = ({
  value,
  onChangeText,
  placeholder = "Placeholder",
  editable = true,
  onPressButton,
  color,
  iconName,
  maskType = "none",
  onTouchStart,
  onBlur,
  ...props
}) => {
  const hasButton = Boolean(onPressButton && color && iconName);
  const inputProps =
    maskType === "textArea" && !hasButton
      ? {
          numberOfLines: props.numberOfLines,
          multiline: props.multiline,
          maxLength: props.maxLength ?? 500,
          style: {
            padding: 2,
            margin: 3,
            height: (props.numberOfLines || 1) * 22,
          },
        }
      : {};

  return (
    <View>
      <InputContainer>
        <InputWrapper style={styles.backgroundColor}>
          {onTouchStart ? (
            <TouchableOpacity style={styles.input} onPress={onTouchStart}>
              <StyledInput
                placeholder={placeholder}
                value={formatValue(value || placeholder, maskType)}
                editable={false}
                pointerEvents="none"
                showSoftInputOnFocus={false}
                placeholderTextColor={"#424242"}
              />
            </TouchableOpacity>
          ) : (
            <StyledInput
              placeholder={placeholder}
              value={formatValue(value, maskType)}
              onChangeText={
                onChangeText
                  ? (text) => onChangeText(formatValue(text, maskType))
                  : undefined
              }
              editable={editable}
              placeholderTextColor={"#424242"}
              keyboardType={
                maskType === "decimal" || maskType === "currency"
                  ? "numeric"
                  : "default"
              }
              onBlur={onBlur}
              {...inputProps}
            />
          )}
          {hasButton && color && iconName && (
            <Button
              height="38px"
              style={styles.margin}
              width="12%"
              onPress={onPressButton}
            >
              <Icon name={iconName} color={color} size={30} />
            </Button>
          )}
        </InputWrapper>
      </InputContainer>
    </View>
  );
};

const InputContainer = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
`;

const InputWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: #eaeaea;
  border-radius: 8px;
  padding-left: 8px;
`;

const StyledInput = styled(TextInput)`
  flex: 1;
  height: 50px;
  font-size: 15px;
  color: #424242;
`;

const styles = {
  margin: {
    margin: 6,
  },
  backgroundColor: {
    backgroundColor: "rgba(255, 255, 255, 0.644)",
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: "#424242",
  },
};
