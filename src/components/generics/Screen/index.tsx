import React from "react";
import { Container, Header, Body, Footer } from "./styles";
import { FlatList} from "react-native-gesture-handler";
import { View } from "react-native";

interface Props {
  header: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
  headerFlex?: number;
  bodyFlex?: number;
  footerFlex?: number;
}

export const Screen: React.FC<Props> = ({
  header,
  body,
  footer,
  headerFlex = 1,
  bodyFlex = 10,
  footerFlex = 1.5,
}) => {
  const bodyContent = [{ key: "body", content: body }];

  return (
    <Container>
      <Header flex={headerFlex}>{header}</Header>
      <Body flex={bodyFlex}>
        <FlatList
          data={bodyContent}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>{item.content}</View>
          )}
          keyExtractor={(item) => item.key}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </Body>
      {footer && <Footer flex={footerFlex}>{footer}</Footer>}
    </Container>
  );
};
