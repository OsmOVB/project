import { TogglePasswordVisibilityButton } from "@components/generics/buttons/TogglePasswordVisibilityButton";
import React, { useState } from "react";
import styled from "styled-components/native";

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  onPress?: () => void;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder = "Senha",
  editable = true,
  onPress,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputContainer>
      <InputWrapper>
        <StyledPasswordInput
          secureTextEntry={!showPassword}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholderTextColor={"#424242"}
        />
        <TogglePasswordVisibilityButton
          isVisible={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
        />
      </InputWrapper>
    </InputContainer>
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
  border-width: 2px;
  border-color: #eaeaea;
  background-color: #fafafa;
  border-radius: 5px;
  margin-top: 4%;
  padding-right: 10px;
  padding-left: 8px;
`;

const StyledPasswordInput = styled.TextInput`
  flex: 1;
  height: 50px;
  font-size: 15px;
  color: #424242;
`;

const styles = {
  toggleButton: {
    padding: 10,
  },
};
