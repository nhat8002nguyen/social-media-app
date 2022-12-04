import { Text } from "@nextui-org/react";

interface TextProps {
  text: string;
  styles?: any;
}

export const SmallGreyText = ({ text, styles }: TextProps) => {
  return (
    <Text h6 size={11} color="grey" css={styles}>
      {text}
    </Text>
  );
};

export const CardTitleText = ({ text, styles }: TextProps) => {
  return (
    <Text h6 size={13} color="black" css={styles}>
      {text}
    </Text>
  );
};

export const HashTagText = ({ text, styles }: TextProps) => {
  return (
    <Text h6 size={14} color="blue" css={styles}>
      {text}
    </Text>
  );
};
