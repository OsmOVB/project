import { ButtonProps as StyledButtonProps } from '@styles/types';

export type ButtonProps =
  Omit<StyledButtonProps, 'borderColor' | 'borderWidth' | 'backgroundColor'> &
  {
    onPress: () => void;
    label?: string;
    backgroundColor?: string;
    opacity?: number;
    textColor?: string;
    borderColor?: string;
    borderWidth?: number;
    bold?: boolean;
  };
