import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import {
  CellText,
  HeaderCell,
  HeaderText,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "./styles";

export type Column = {
  key: string;
  title: string;
  width?: number | `${number}%`;
  renderCell?: (item: any) => React.ReactNode;
};

type GenericTableProps = {
  columns: Column[];
  data: any[];
  onRowPress?: (item: any) => void;
};

export const GenericTable: React.FC<GenericTableProps> = ({
  columns,
  data,
  onRowPress,
}) => {
  return (
    <TableContainer>
      <TableHeader>
        {columns.map((col) => (
          <HeaderCell
            key={col.key}
            style={{
              flexBasis: getValidWidth(col.width),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HeaderText>{col.title}</HeaderText>
          </HeaderCell>
        ))}
      </TableHeader>

      <ScrollView style={{ flex: 1 }}>
        {data.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => onRowPress?.(item)}>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  style={{
                    flexBasis: getValidWidth(col.width),
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {col.renderCell ? (
                    col.renderCell(item)
                  ) : (
                    <CellText>{item[col.key]}</CellText>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </TableContainer>
  );
};

const getValidWidth = (width?: number | `${number}%`): ViewStyle["flexBasis"] => {
  if (!width) return "auto";
  if (typeof width === "number") return width;
  if (typeof width === "string" && /^\d+%$/.test(width)) return width;
  return "auto";
};

