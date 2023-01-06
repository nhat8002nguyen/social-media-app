import { appColors } from "@/shared/theme";
import { ArrowCircleUp } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { GlobalState } from "redux/slices/global";
import { RootState } from "redux/store/store";

export const ScrollToTopButton = (): JSX.Element => {
  const { scrollTopButtonVisible }: GlobalState = useSelector(
    (state: RootState) => state.global
  );
  const handleArrowUpClick = () => {
    window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  };

  return (
    <div
      style={{
        position: "absolute",
        right: "3rem",
        bottom: "3rem",
        cursor: "pointer",
      }}
    >
      {scrollTopButtonVisible && (
        <ArrowCircleUp
          fontSize="large"
          htmlColor={appColors.primary}
          onClick={handleArrowUpClick}
        />
      )}
    </div>
  );
};
