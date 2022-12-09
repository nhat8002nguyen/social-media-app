import { AppNormalText, AppSmallText } from "@/components/atoms/appTexts";
import FollowButton from "@/components/atoms/follow_button/FollowButton";
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
import { ProfilePageGetStaticProps } from "pages/profile/[id]";
import { ReactElement } from "react";
import { SummaryState } from "redux/slices/profile/summary/summarySlice";
import styles from "./styles.module.css";

export default function ProfileSummaryCard({
  summary: initialSummary,
  posts,
  likedPosts,
}: ProfilePageGetStaticProps) {
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
            <FollowButton followingStatus="idle" onFollowClick={() => {}} />
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
              <Link href={appPages.profile + "/" + initialSummary.id}>
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
