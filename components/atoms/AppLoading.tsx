import { Loading, LoadingProps } from "@nextui-org/react";
import { CSSProperties } from "react";

interface AppLoadingProps {
  styles?: CSSProperties;
  color?: LoadingProps["color"];
  size?: LoadingProps["size"];
}

export const AppButtonLoading = (props: AppLoadingProps) => {
  return (
    <Loading
      style={props.styles}
      type="points"
      color="currentColor"
      size="sm"
      {...props}
    />
  );
};

export const AppPageLoading = (props: AppLoadingProps) => {
  return (
    <Loading
      style={props.styles}
      type="spinner"
      color="currentColor"
      size="xl"
      {...props}
    />
  );
};
