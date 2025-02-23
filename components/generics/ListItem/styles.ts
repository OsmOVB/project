import styled from 'styled-components/native';

export const Container = styled.View`
  margin-top: 5px;
  background-color: #DEDFDE;
  border-radius: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
`;

export const SectionSeparator = styled.View`
  height: 1px;
  width: 100%;
  background-color: #737373;
`;

export const DetailsContainer = styled.View`
  padding-left: 10px;
  padding-bottom: 5px;
`;

export const DetailsRowContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

export const FooterContainer = styled.View`
  height: 50px;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
`;

export const InvisibleView = styled.View`
  width: 40px;
  height: 40px;  
`

export const ButtonGroupContainer = styled.View`
  width: 23%;
  flex-direction: row;
  justify-content: space-between;
`;

export const ListItemSeparator = styled.View`
  height: 20px;
  width: 100%;
`;
