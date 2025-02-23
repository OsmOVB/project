import styled from 'styled-components/native';

type ContainerProps = {
  backgroundColor: string;
}

export const Container = styled.View<ContainerProps>`
  padding: 10px;
  border-radius: 25px;
  align-items: center;
  justify-content: center;
  background-color: ${({ backgroundColor }) => backgroundColor};
`;
