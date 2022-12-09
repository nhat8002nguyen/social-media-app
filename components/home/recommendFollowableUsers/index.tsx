import { CardTitleText, SmallGreyText } from "@/components/atoms/appTexts";
import FollowButton from "@/components/atoms/follow_button/FollowButton";
import useAppearedUsers from "@/hooks/useAppearedUsers";
import appPages from "@/shared/appPages";
import { ArrowForwardRounded } from "@mui/icons-material";
import { Avatar, Card } from "@nextui-org/react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import {
  makeFollowAUser,
  makeUnfollowAUser,
  PersonCardState,
  showOtherUsers,
} from "redux/slices/home/followableUsers/recommendUserListSlice";
import { AppDispatch, RootState, useAppDispatch } from "redux/store/store";
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

  const handleFollowClick = () => {
    handleFollowButtonClick({
      sessionUserId: session?.user.DBID,
      followingStatus,
      dispatch,
      followingUserId: userId,
    });
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
      <Link href={appPages.profile + "/" + userId}>
        <a>
          <Avatar pointer rounded src={image} />
        </a>
      </Link>
      <Link
        href={{
          pathname: appPages.profile + "/" + userId,
        }}
      >
        <a>
          <CardTitleText
            text={name.slice(0, 16)}
            styles={{ marginTop: "1rem", cursor: "pointer" }}
          />
        </a>
      </Link>
      <SmallGreyText text={shortBio.slice(0, 16)} />
      <FollowButton
        followingStatus={followingStatus}
        onFollowClick={handleFollowClick}
      />
    </Card>
  );
};

export interface FollowClickProps {
  sessionUserId: AuthState["session"]["user"]["DBID"];
  followingStatus: PersonCardState["followingStatus"];
  dispatch: AppDispatch;
  followingUserId: number;
}

export const handleFollowButtonClick = ({
  sessionUserId,
  followingStatus,
  dispatch,
  followingUserId,
}: FollowClickProps) => {
  if (sessionUserId != null) {
    (followingStatus == "followable" || followingStatus == "idle") &&
      dispatch(
        makeFollowAUser({
          userId: sessionUserId,
          followingId: followingUserId,
        })
      );
    followingStatus == "following" &&
      dispatch(
        makeUnfollowAUser({
          userId: sessionUserId,
          followingId: followingUserId,
        })
      );
  }
};
