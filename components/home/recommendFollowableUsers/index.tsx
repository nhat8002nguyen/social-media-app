import { AppButtonLoading } from "@/components/atoms/AppLoading";
import { CardTitleText, SmallGreyText } from "@/components/atoms/appTexts";
import useAppearedUsers from "@/hooks/useAppearedUsers";
import { ArrowForwardRounded } from "@mui/icons-material";
import { Avatar, Button, Card } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import {
  makeFollowAUser,
  makeUnfollowAUser,
  PersonCardState,
  showOtherUsers,
} from "redux/slices/home/followableUsers/recommendUserListSlice";
import { RootState, useAppDispatch } from "redux/store/store";
import styles from "./styles.module.css";

export default function RecommendFollowableUsers() {
  const { appearedUsers } = useAppearedUsers();
  const dispatch = useAppDispatch();

  const handleArrowClick = () => {
    dispatch(showOtherUsers({ showType: "next" }));
  };

  return (
    <div className={styles.recommendedPeople}>
      <div className={styles.cardListHeader}>
        <p>Follow People</p>
        <ArrowForwardRounded
          style={{ cursor: "pointer" }}
          onClick={handleArrowClick}
        />
      </div>
      <div className={styles.recommendList}>
        {appearedUsers.map((person) => {
          return <PersonItem key={person.userId} {...person} />;
        })}
      </div>
    </div>
  );
}

const PersonItem = (props: PersonCardState) => {
  const { userId, image, name, shortBio, followingStatus } = props;
  const dispatch = useAppDispatch();
  const { session }: AuthState = useSelector((state: RootState) => state.auth);

  const getLetterColor = () => {
    return followingStatus == "following" ? "white" : "#005FF9";
  };

  const getBackgroundColor = () => {
    return followingStatus == "following" ? "#005FF9" : "white";
  };

  const getButtonName = () => {
    return followingStatus == "following" ? "Following" : "+ Follow";
  };

  const handleFollowClick = () => {
    const sessionUserId = session?.user.db_id;
    if (sessionUserId != null) {
      (followingStatus == "followable" || followingStatus == "idle") &&
        dispatch(
          makeFollowAUser({ userId: session.user.db_id, followingId: userId })
        );
      followingStatus == "following" &&
        dispatch(
          makeUnfollowAUser({ userId: session.user.db_id, followingId: userId })
        );
    }
  };

  return (
    <Card
      key={userId}
      color="default"
      css={{
        mh: "$50",
        w: "$35",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <Avatar rounded src={image} />
      <CardTitleText text={name.slice(0, 16)} styles={{ marginTop: "1rem" }} />
      <SmallGreyText text={shortBio.slice(0, 16)} />
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
        onClick={handleFollowClick}
      >
        {followingStatus != "pending" ? getButtonName() : <AppButtonLoading />}
      </Button>
    </Card>
  );
};
