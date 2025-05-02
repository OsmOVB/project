import React from 'react';
import { BoldText } from '@styles/global';
import { Container } from './styles';
import { StatusValue } from '../types';

type StatusProps<T extends string> = {
  status: T;
  statuses: Record<T, StatusValue>;
}

export type StatusKey = 'exported' | 'nonExported';

export const ListItemStatus = <T extends string>({ status, statuses }: StatusProps<T>) => {
  const { backgroundColor, description } = statuses[status];

  return (
    <Container backgroundColor={backgroundColor}>
      <BoldText color="#FFF">{description}</BoldText>
    </Container>
  );
};
