import styled from "styled-components/native";

const TableContainer = styled.View`
  flex: 1;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 5px;
  overflow: hidden;
`;

const TableHeader = styled.View`
  flex-direction: row;
  background-color: #f2f2f2;
  padding: 10px;
`;

const HeaderCell = styled.View`
  flex: 1;
  align-items: center;
`;

const HeaderText = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: black;
`;

const TableRow = styled.View`
  flex-direction: row;
  padding: 10px;
  border-bottom-width: 1px;
  border-bottom-color: #ddd;
`;

const TableCell = styled.View`
  flex: 1;
  align-items: center;
`;

const CellText = styled.Text`
  font-size: 15px;
  color: black;
`;

export {
    TableContainer,
    TableHeader,
    HeaderCell,
    HeaderText,
    TableRow,
    TableCell,
    CellText,
    };