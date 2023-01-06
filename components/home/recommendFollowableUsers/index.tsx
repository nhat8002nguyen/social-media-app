import ProfileLink from "@/components/atoms/ProfileLink";
import { SmallGreyText } from "@/components/atoms/appTexts";
import { AppMaskLoading } from "@/components/atoms/app_mask_loading";
import FollowButton from "@/components/atoms/follow_button/FollowButton";
import useAppearedUsers from "@/hooks/useAppearedUsers";
import usePrefetchProfilePage from "@/hooks/usePrefetchProfilePage";
import { ArrowForwardRounded } from "@mui/icons-material";
import { Avatar, Card, Text } from "@nextui-org/react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import {
  PersonCardState,
  makeFollowAUser,
  makeUnfollowAUser,
  showOtherUsers,
} from "redux/slices/home/followableUsers/recommendUserListSlice";
import { AppDispatch, RootState, useAppDispatch } from "redux/store/store";
import styles from "./styles.module.css";

export default function RecommendFollowableUsers() {
  const dispatch = useAppDispatch();
  const { appearedUsers } = useAppearedUsers();
  usePrefetchProfilePage({ ids: appearedUsers?.map((u) => u.userId) });

  const handleArrowClick = () => {
    dispatch(showOtherUsers({ showType: "next" }));
  };

  return (
    <div className={styles.recommendedPeople}>
      <div className={styles.cardListHeader}>
        <p>Follow People</p>
        <ArrowForwardRounded
          className={styles.cardListHeaderArrow}
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
  const [loading, setLoading] = useState<boolean>(false);

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
    <AppMaskLoading style={{ flex: 1 }} isLoading={loading}>
      <Card
        key={userId}
        color="default"
        css={{
          mh: "$50",
          w: "$35",
          alignItems: "center",
          backgroundColor: "white",
          padding: "$5",
        }}
      >
        <ProfileLink
          sessionId={session?.user.DBID}
          profileId={userId}
          child={<Avatar pointer rounded src={image} />}
          setLoading={setLoading}
        />
        <ProfileLink
          sessionId={session?.user.DBID}
          profileId={userId}
          child={
            <Text
              h6
              size={13}
              color="black"
              css={{ marginTop: "$5", marginBottom: "$0", cursor: "pointer" }}
            >
              {name.split(/\s/).slice(0, 2).join(" ").slice(0, 16)}
            </Text>
          }
          setLoading={setLoading}
        />
        <ShortBioText shortBio={shortBio} />
        <FollowButton
          followingStatus={followingStatus}
          onFollowClick={handleFollowClick}
        />
      </Card>
    </AppMaskLoading>
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
