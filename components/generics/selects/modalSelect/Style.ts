import styled from 'styled-components/native'

type ColorType = {
  color: string;
}

export const TextInputContainer = styled.View`
  display: flex;
  border-radius: 8px;
  flex-direction: row;
  border-width: 1px;
  align-items: center;
`;

export const TextInputQrCodeContainer = styled.View`
  display: flex;
  border-radius: 8px;
  flex-direction: row;
  border-width: 1px;
  align-items: center;
  width: 85%;
  margin-right: 10px;
`;

export const HeaderContainer = styled.View<ColorType>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) => props.color};
  padding: 15px;
`;

export const InputSearch = styled.TextInput`
  width: 90%;
  color: black;
`;

export const QrInputSearch = styled.TextInput`
  width: 85%;
  color: black;
`;

export const Margin = styled.View`
  flex: 1;
  margin: 5%;
`;

export const BottomContainer = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 3%;
  padding-left: 3%;
  padding-right: 3%;
`;

export const CenteredBottom = styled.View`
  align-items: center;
  margin-top: 20px;
`;

export const RowView = styled.View`
display: flex;
flex-direction: row;
`;