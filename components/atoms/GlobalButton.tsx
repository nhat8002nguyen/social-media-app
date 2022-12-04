import { appColors } from "@/shared/theme";
import { Avatar, Button } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { RootState } from "redux/store/store";
import { AppButtonLoading } from "./AppLoading";

interface GlobalButtonProps {
  text: string;
  onPress: () => void;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  icon?: JSX.Element;
  loading?: boolean;
}

export default function GlobalButton({
  text,
  onPress,
  size,
  icon,
  loading,
}: GlobalButtonProps) {
  const { session }: AuthState = useSelector((state: RootState) => state.auth);
  return (
    <Button
      size={size ?? "md"}
      color={"primary"}
      css={{
        maxW: "$10",
        backgroundColor: appColors.white,
        border: "1px solid #005FF9",
        color: appColors.primary,
        marginTop: "$10",
        padding: "$5",
      }}
      onPress={() => onPress()}
    >
      {!loading && session?.user.image != null ? (
        <Avatar
          css={{ marginRight: "$5" }}
          size={"sm"}
          src={session.user.image}
          rounded
        />
      ) : (
        icon
      )}
      {!loading && text}
      {loading && <AppButtonLoading />}
    </Button>
  );
}
