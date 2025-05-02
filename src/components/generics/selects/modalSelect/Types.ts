import { IconProps } from '@components/Icon';
import { ViewStyle } from 'react-native';

type StyleProp<T> = T | ViewStyle | ViewStyle[];

export interface ElementProps<T>{
    item?: T[];
    label: string;
    value: string | number;
    onPress: () => void;
    isSelected?: boolean;
    style?: StyleProp<ViewStyle>;
    iconPropsGenericList?: IconProps;
    sizeIconList?: number;
    visible?: boolean; 
    headerBgColor?: string; 
}

export interface SelectElementProps<T> {
    items: T[];
    selectedValue: T;
    onValueChange: (value: T) => void;
    labelExtractor: (item: T) => string;
    valueExtractor: (item: T) => string;
    iconPropsGenericList?: IconProps;
    sizeIconList?: number;   
}
