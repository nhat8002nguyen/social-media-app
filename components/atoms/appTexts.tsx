import { FormElement, Text } from "@nextui-org/react";
import { CSSProperties, MouseEventHandler } from "react";

interface TextProps {
  text: string;
  styles?: CSSProperties;
  onClick?: MouseEventHandler<FormElement>;
}

export const SmallGreyText = ({ text, styles, onClick }: TextProps) => {
  return (
    <a>
      <Text onClick={onClick} h6 size={11} color="grey" css={{ ...styles }}>
        {text}
      </Text>
    </a>
  );
};

export const CardTitleText = ({ text, styles }: TextProps) => {
  return (
    <a>
      <Text h6 size={13} color="black" css={{ ...styles }}>
        {text}
      </Text>
    </a>
  );
};

export const AppNormalText = ({ text, styles }: TextProps) => {
  return (
    <a>
      <Text color="grey" css={{ ...styles }}>
        {text}
      </Text>
    </a>
  );
};

export const AppSmallText = ({ text, styles }: TextProps) => {
  return (
    <a>
      <Text size={13} color="grey" css={{ ...styles }}>
        {text}
      </Text>
    </a>
  );
};

export const HashTagText = ({ text, styles }: TextProps) => {
  return (
    <Text h6 size={14} color="blue" css={{ ...styles }}>
      {text}
    </Text>
  );
};
