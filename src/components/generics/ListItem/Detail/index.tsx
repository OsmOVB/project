import React from 'react';
import { BoldText, Text, FlexContainer } from '@styles/global';
import { AlignItemsValue } from '@styles/types';

type ListItemDetailProps = {
  name: string;
  value: string | number;
  marginRight?: number;
  wrapText?: boolean;
  alignItems?: AlignItemsValue;
}

export const ListItemDetail = ({
  name,
  value,
  marginRight,
  wrapText = false,
  alignItems = 'flex-start', // Alterado para 'flex-start' para evitar sobreposição
}: ListItemDetailProps) => (
<FlexContainer  
    flexDirection="row"
    alignItems={alignItems}
    marginRight={marginRight}
    style={{ width: '100%' }}
>
    <BoldText marginRight={5}>{name}:</BoldText>
    <FlexContainer style={{ flex: 1 }}>
        <Text 
            style={{ 
                flexWrap: wrapText ? 'wrap' : 'nowrap',
                color: 'black',
                flex: 1,
            }}
        >
            {value ?? 'N/A'}
        </Text>
    </FlexContainer>
</FlexContainer>
);
