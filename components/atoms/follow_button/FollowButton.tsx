import { Button } from "@nextui-org/react";
import { MouseEventHandler } from "react";
import { AppButtonLoading } from "../AppLoading";

export interface FollowButtonProps {
  followingStatus: "idle" | "pending" | "followable" | "following";
  onFollowClick: MouseEventHandler<HTMLButtonElement>;
}

export default function FollowButton(props: FollowButtonProps) {
  const { followingStatus, onFollowClick } = props;

  const getLetterColor = () => {
    return followingStatus == "following" ? "white" : "#005FF9";
  };

  const getBackgroundColor = () => {
    return followingStatus == "following" ? "#005FF9" : "white";
  };

  const getButtonName = () => {
    return followingStatus == "following" ? "Following" : "+ Follow";
  };

  return (
    <Button
      size="xs"
      color={"default"}
      css={{
        maxW: "$10",
        backgroundColor: getBackgroundColor(),
        border: "1px solid #005FF9",
        color: getLetterColor(),
        marginTop: "$10",
        padding: "$5",
      }}
      onClick={onFollowClick}
    >
      {followingStatus != "pending" ? getButtonName() : <AppButtonLoading />}
    </Button>
  );
}
