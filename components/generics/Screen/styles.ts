import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 3% 6% 0 6%;
`;

const Header = styled.View<{ flex: number }>`
  width: 100%;
  flex: ${({ flex }) => flex};
`;

const Body = styled.View<{ flex: number }>`
  flex: ${({ flex }) => flex};
  width: 100%;
`;

const ScrollableContent = styled.View`
  flex: 1;
  width: 100%;
`;

const Footer = styled.View<{ flex: number }>`
  flex: ${({ flex }) => flex};
  width: 100%;
  align-items: center;
  margin-top: 1%;
`;

export { Container, Header, Body, ScrollableContent, Footer };
