import { AppPageLoading } from "@/components/atoms/AppLoading";
import NavigationBar, {
  NavigationBarProps,
  homeActiveTabs,
  profilePostTabs,
} from "@/components/home/navigation_bar";
import EvaluationPost from "@/components/home/post";
import Container from "@/components/mocules/container";
import ProfileSummaryCard from "@/components/profile/profile_summary_card/ProfileSummaryCard";
import {
  ProfilePageGetServerSideProps,
  fetchUserLikedPosts,
  fetchUserPosts,
  fetchUserSharedPosts,
  fetchUserSummary,
} from "@/services/profileServices";
import appPages from "@/shared/appPages";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { PostListState, PostState } from "redux/slices/home/posts/interfaces";
import { setPostsList } from "redux/slices/home/posts/postListSlice";
import { setProfileSummary } from "redux/slices/profile/summary/summarySlice";
import { RootState, useAppDispatch } from "redux/store/store";
import styles from "./styles.module.css";

export default function Profile({
  summary: initialSummary,
  posts: postsOfUser,
  likedPosts: postsLikedByUser,
  sharedPosts,
}: ProfilePageGetServerSideProps) {
  const dispatch = useAppDispatch();
  const { data: session, status: sessionState } = useSession();

  const { session: authSession }: AuthState = useSelector(
    (state: RootState) => state.auth
  );
  const { posts }: PostListState = useSelector(
    (state: RootState) => state.postList
  );

  const [currentPosts, setCurrentPosts] = useState<PostState[]>(postsOfUser);

  useEffect(() => {
    if ((session as any)?.error === "RefreshAccessTokenError") {
      signIn(); // Force sign in to hopefully resolve error
    }
  }, [session]);

  useEffect(() => {
    dispatch(setProfileSummary(initialSummary));
  }, [initialSummary]);

  useEffect(() => {
    // re-set posts if it's not shown
    setTimeout(() => {
      if (posts.length == 0) {
        dispatch(setPostsList(currentPosts));
      }
    }, 3000);
  }, []);

  const handlePostTabChange = (tab: NavigationBarProps["tabs"][number]) => {
    switch (tab.name) {
      case "POST":
        dispatch(setPostsList(postsOfUser));
        setCurrentPosts(postsOfUser);
        break;
      case "LIKED":
        dispatch(setPostsList(postsLikedByUser));
        setCurrentPosts(postsLikedByUser);
        break;
      case "SHARED":
        dispatch(setPostsList(sharedPosts));
        setCurrentPosts(sharedPosts);
        break;
      default:
        dispatch(setPostsList(postsOfUser));
        break;
    }
  };

  return (
    <Container page={appPages.profile}>
      <NavigationBar tabs={homeActiveTabs} type="APP" />
      <ProfileSummaryCard summary={initialSummary} />
      <NavigationBar
        tabs={profilePostTabs}
        type="PROFILE"
        onTabChange={handlePostTabChange}
      />
      <div className={styles.listPost}>
        {posts.length == 0 ? (
          <AppPageLoading />
        ) : (
          posts.map((post: PostState) => (
            <EvaluationPost key={post.id} postState={post} />
          ))
        )}
      </div>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps<
  ProfilePageGetServerSideProps
> = async (context: GetServerSidePropsContext) => {
  try {
    const userId = context.params.id;

    const summaryReq = fetchUserSummary({ profileId: userId });
    const postsReq = fetchUserPosts(userId);
    const likedPostsReq = fetchUserLikedPosts({
      userId: parseInt(typeof userId == "string" ? userId : userId[0]),
    });
    const sharedPostReq = fetchUserSharedPosts({
      userId: parseInt(typeof userId == "string" ? userId : userId[0]),
    });

    const [summary, posts, likedPosts, sharedPosts] = await Promise.all([
      summaryReq,
      postsReq,
      likedPostsReq,
      sharedPostReq,
    ]);

    return {
      props: {
        summary,
        posts,
        likedPosts,
        sharedPosts,
      },
    };
  } catch (err) {
    console.error(err);
    throw Error("Can not fetch profile info of user " + context.params.id);
  }
};
