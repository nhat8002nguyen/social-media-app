import { appColors } from "@/shared/theme";
import { ArrowCircleUp } from "@mui/icons-material";
import { useEffect, useState } from "react";

export const ScrollToTopButton = (): JSX.Element => {
  const [visible, setVisible] = useState<boolean>(false);
  const handleArrowUpClick = () => {
    window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (document) {
      document.onscroll = () => {
        setVisible(window.scrollY > 2000);
      };
    }
    return () => (document.onscroll = null);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        right: "3rem",
        bottom: "3rem",
        cursor: "pointer",
      }}
    >
      {visible && (
        <ArrowCircleUp
          fontSize="large"
          htmlColor={appColors.primary}
          onClick={handleArrowUpClick}
        />
      )}
    </div>
  );
};
