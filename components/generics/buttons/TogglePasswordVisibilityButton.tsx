import React from "react";
import { EyeClosePasswordIcon, EyeOpenPasswordIcon } from "@assets/icons";
import { EyeButton } from "@modules/common/screens/changePassword/Style";


type Props = {
  isVisible: boolean;
  onToggle: () => void;
};

export const TogglePasswordVisibilityButton: React.FC<Props> = ({ isVisible, onToggle }) => {
  return (
    <EyeButton onPress={onToggle} style={{ padding: 100 }}>
      {isVisible ? (
        <EyeOpenPasswordIcon size={20} color={"#424242"} />
      ) : (
        <EyeClosePasswordIcon size={20} color={"#424242"} />
      )}
    </EyeButton>
  );
};
