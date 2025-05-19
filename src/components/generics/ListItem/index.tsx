import React, { ReactElement } from 'react';
import { Container, SectionSeparator, DetailsContainer, FooterContainer } from './styles';

type ListItemProps = {
  details: ReactElement;
  footer: ReactElement;
}

export const ListItem = ({ details, footer }: ListItemProps) => {
  return (
    <Container>
      <DetailsContainer>
        {details}
      </DetailsContainer>
      <SectionSeparator />
      <FooterContainer>
        {footer}
      </FooterContainer>
    </Container>
  );
};
