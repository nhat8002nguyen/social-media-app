import { SmallGreyText } from "@/components/atoms/appTexts";
import FollowButton from "@/components/atoms/follow_button/FollowButton";
import ProfileLink from "@/components/atoms/ProfileLink";
import useAppearedUsers from "@/hooks/useAppearedUsers";
import { ArrowForwardRounded } from "@mui/icons-material";
import { Avatar, Card, Text } from "@nextui-org/react";
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
      <ProfileLink
        sessionId={session?.user.DBID}
        profileId={userId}
        child={<Avatar pointer rounded src={image} />}
      />
      <ProfileLink
        sessionId={session?.user.DBID}
        profileId={userId}
        child={
          <Text
            h6
            size={13}
            color="black"
            css={{ marginTop: "1rem", cursor: "pointer" }}
          >
            {name.slice(0, 16)}
          </Text>
        }
      />

      <ShortBioText shortBio={shortBio} />

      <FollowButton
        followingStatus={followingStatus}
        onFollowClick={handleFollowClick}
      />
    </Card>
  );
};

const ShortBioText = ({ shortBio }): JSX.Element => {
  const shortBioWords = shortBio.split(/\s/);
  return (
    <div style={{ textAlign: "center" }}>
      <SmallGreyText text={shortBioWords[0]} />
      <SmallGreyText
        text={shortBioWords[1]}
        styles={shortBioWords ? { height: "1rem" } : null}
      />
    </div>
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
