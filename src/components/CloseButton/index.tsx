import React from "react";
import { RoundedButtonProps } from "@styles/types";
import { RoundedButton } from "@styles/global";
import { XmarkIcon } from "@assets/icons";

type CloseButtonProps = RoundedButtonProps & {
  onPress: () => void;
};

export const CloseButton = ({ onPress, ...rest }: CloseButtonProps) => (
  <RoundedButton onPress={onPress} {...rest}>
    <XmarkIcon size={30} color="#f0f0f0" />
  </RoundedButton>
);
