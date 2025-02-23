import React, { useState } from "react";
import styled from "styled-components/native";
import { TouchableOpacity, TextInput } from "react-native";

interface EditableInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  textStyle?: object;
  inputStyle?: object;
  containerStyle?: object;
  maxLength?: number;
  editable?: boolean;
}

const Container = styled.View`
  width: 100%;
`;

const StyledTouchable = styled(TouchableOpacity)`
  height: 50px;
  border-radius: 5px;
  border-width: 1px;
  border-color: #eaeaea;
  background-color: #fafafa;
  justify-content: center;
`;

const StyledText = styled.Text`
  font-size: 15px;
  color: #a0a0a0;
  padding-left: 10px;
`;

const StyledInput = styled(TextInput)`
  height: 50px;
  border-radius: 5px;
  border-width: 1px;
  border-color: grey;
  background-color: #fff;
  font-size: 15px;
  color: #000;
  padding-left: 10px;
`;


const EditableInput: React.FC<EditableInputProps> = ({
  value,
  onChange,
  placeholder = "Clique para editar...",
  textStyle = {},
  inputStyle = {},
  containerStyle = {},
  maxLength = 40,
  editable = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  return (
    <Container style={containerStyle}>
      {isEditing ? (
        <StyledInput
          style={inputStyle}
          value={tempValue}
          onChangeText={setTempValue}
          autoFocus
          onBlur={handleSave}
          maxLength={maxLength}
          placeholder={placeholder}
          placeholderTextColor="grey"
          editable={editable}
        />
      ) : (
        <StyledTouchable onPress={() => setIsEditing(true)} style={containerStyle}>
          <StyledText style={textStyle}>
            {value.length > 0 ? value : placeholder}
          </StyledText>
        </StyledTouchable>
      )}
    </Container>
  );
};

export default EditableInput;
