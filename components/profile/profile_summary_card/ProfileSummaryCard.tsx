import { AppNormalText, AppSmallText } from "@/components/atoms/appTexts";
import FollowButton from "@/components/atoms/follow_button/FollowButton";
import { handleFollowButtonClick } from "@/components/home/recommendFollowableUsers";
import appPages from "@/shared/appPages";
import { appColors } from "@/shared/theme";
import {
  CalendarToday,
  CheckCircle,
  Link as LinkIcon,
} from "@mui/icons-material";
import { Avatar, Card, Text } from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ProfilePageGetServerSideProps } from "pages/profile/[id]";
import { ReactElement } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import {
  FollowableUsersState,
  PersonCardState,
} from "redux/slices/home/followableUsers/recommendUserListSlice";
import { SummaryState } from "redux/slices/profile/summary/summarySlice";
import { RootState, useAppDispatch } from "redux/store/store";
import styles from "./styles.module.css";

export default function ProfileSummaryCard({
  summary: initialSummary,
}: ProfilePageGetServerSideProps) {
  const { totalFollowableUsers }: FollowableUsersState = useSelector(
    (state: RootState) => state.recommendUserList
  );
  const dispatch = useAppDispatch();
  const { session }: AuthState = useSelector((state: RootState) => state.auth);

  const getFollowingStatus = (): PersonCardState["followingStatus"] => {
    const userCardState = totalFollowableUsers.find(
      (u) => u.userId == initialSummary.id
    );
    return userCardState?.followingStatus ?? "idle";
  };

  const handleFollowClick = () => {
    handleFollowButtonClick({
      sessionUserId: session?.user.DBID,
      followingStatus: getFollowingStatus(),
      dispatch,
      followingUserId: initialSummary.id,
    });
  };

  return (
    <Card
      css={{ minHeight: "15rem", maxWidth: "50rem", backgroundColor: "white" }}
    >
      <div className={styles.summary}>
        <div className={styles.summaryHeader}>
          <div className={styles.summaryHeaderLeft}>
            <Avatar size={"xl"} src={initialSummary.image} rounded />
            <div className={styles.userNameAndShortBio}>
              <div className={styles.userNameAndTick}>
                <Text css={{ fontWeight: "bold" }}>
                  {initialSummary.username}
                </Text>
                {true ? <CheckCircle color="primary" fontSize="small" /> : null}
              </div>
              <Text css={{ fontSize: "small" }}>{initialSummary.shortBio}</Text>
            </div>
          </div>
          <div className={styles.summaryHeaderRight}>
            <FollowButton
              followingStatus={getFollowingStatus()}
              onFollowClick={() => handleFollowClick()}
            />
          </div>
        </div>
        <div className={styles.summaryBody}>
          <AppNormalText
            text={
              initialSummary.about ??
              "Hello everyone, nice to meet you, My name is " +
                initialSummary.username
            }
          />
          <div className={styles.summaryLinkAndDate}>
            <div className={styles.summaryLink}>
              <LinkIcon color="disabled" />
              <Link passHref href={appPages.profile + "/" + initialSummary.id}>
                <AppSmallText
                  styles={{ color: appColors.primary }}
                  text={appPages.profile + "/" + initialSummary.id}
                />
              </Link>
            </div>
            <div className={styles.summaryDate}>
              <CalendarToday color="disabled" fontSize="inherit" />
              <AppSmallText
                text={
                  "Joined on " +
                  new Date(initialSummary.createdAt)
                    .toLocaleDateString()
                    .replaceAll("/", "-")
                }
              />
            </div>
          </div>
        </div>
        <div className={styles.summaryFooter}>
          <div className={styles.summaryFollowers}>
            <AppSmallText
              text={initialSummary.followersCount.toString() + " Followers"}
            />
            <SummaryFollowerImages followersInfo={initialSummary.followers} />
          </div>
          <div>
            <AppSmallText
              text={initialSummary.followingsCount.toString() + " Followings"}
            />
            <SummaryFollowingImages followersInfo={initialSummary.followings} />
          </div>
        </div>
      </div>
    </Card>
  );
}

interface SummaryFollowerImagesProps {
  followersInfo: SummaryState["summary"]["followers"];
}

interface SummaryFollowingImagesProps {
  followersInfo: SummaryState["summary"]["followings"];
}

const SummaryFollowerImages = ({
  followersInfo,
}: SummaryFollowerImagesProps): ReactElement => {
  const router = useRouter();
  const handleImageClick = (
    person: SummaryState["summary"]["followers"][number]
  ) => {
    router.push({
      pathname: appPages.profile + "/[profileId]",
      query: { profileId: person.userId },
    });
  };
  return (
    <div className={styles.summaryFollowImages}>
      {followersInfo.map((person) => (
        <Avatar
          key={person.userId}
          size={"xs"}
          src={person.follower_info.image}
          rounded
          className={styles.summaryFollowImage}
          pointer
          onClick={() => handleImageClick(person)}
        />
      ))}
    </div>
  );
};

const SummaryFollowingImages = ({
  followersInfo,
}: SummaryFollowingImagesProps): ReactElement => {
  const router = useRouter();
  const handleImageClick = (
    person: SummaryState["summary"]["followings"][number]
  ) => {
    router.push({
      pathname: appPages.profile + "/[profileId]",
      query: { profileId: person.followingUser.id },
    });
  };
  return (
    <div className={styles.summaryFollowImages}>
      {followersInfo.map((person) => (
        <Avatar
          key={person.followingUser.id}
          size={"xs"}
          src={person.followingUser.image}
          rounded
          className={styles.summaryFollowImage}
          pointer
          onClick={() => handleImageClick(person)}
        />
      ))}
    </div>
  );
};
