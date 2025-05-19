import React from 'react';
import styled from 'styled-components/native';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
}

const StarContainer = styled(View)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-vertical: 8px;
`;

const StarButton = styled(TouchableOpacity)`
  padding: 5px;
`;

const StarRating: React.FC<StarRatingProps> = ({ rating, onChange, disabled }) => {
  return (
    <StarContainer>
      {[1, 2, 3, 4, 5, 6].map((star) => (
        <StarButton
          key={star}
          onPress={() => !disabled && onChange && onChange(star)}
          disabled={disabled}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={24}
            color={star <= rating ? '#FFD700' : '#ccc'}
          />
        </StarButton>
      ))}
    </StarContainer>
  );
};

export default StarRating;

