import { CSSProperties, ReactNode } from "react";
import { AppPageLoading } from "../AppLoading";
import styles from "./styles.module.css";

export interface AppMaskLoadingProps {
  isLoading?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

export const AppMaskLoading = ({
  children,
  isLoading,
  style,
}: AppMaskLoadingProps): JSX.Element => {
  return (
    <div style={style}>
      {isLoading ? (
        <div className={styles.loadingStatus}>
          <AppPageLoading
            styles={{
              position: "absolute",
              zIndex: 1,
              left: "50%",
              right: "50%",
              top: "2rem",
            }}
          />
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
};
