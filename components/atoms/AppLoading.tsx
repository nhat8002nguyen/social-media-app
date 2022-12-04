import { Loading, LoadingProps } from "@nextui-org/react";

interface AppLoadingProps {
  color?: LoadingProps["color"];
  size?: LoadingProps["size"];
}

export const AppButtonLoading = (props: AppLoadingProps) => {
  return <Loading type="points" color="currentColor" size="sm" {...props} />;
};

export const AppPageLoading = (props: AppLoadingProps) => {
  return <Loading type="spinner" color="currentColor" size="xl" {...props} />;
};
