import { AppPageLoading } from "@/components/atoms/AppLoading";
import HomeNavigation from "@/components/home/homeNavigation";
import EvaluationPost from "@/components/home/post";
import RecommendFollowableUsers from "@/components/home/recommendFollowableUsers";
import UserStatusInput from "@/components/home/userStatusInput";
import LeftSide from "@/components/leftSide";
import CustomizedSnackbars from "@/components/mocules/snackbars";
import RightSide from "@/components/rightSide";
import useNewsFeed from "@/hooks/useNewsFeed";
import { useSnackbarNotificationAndRefreshNewsFeed } from "@/hooks/useSnackbarNotificationAndRefreshNewsFeed";
import appPages from "@/shared/appPages";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { PostState } from "redux/slices/home/posts/postListSlice";
import { RootState } from "redux/store/store";
import styles from "./styles.module.css";

export default function Home() {
  const { data: session, status: sessionState } = useSession();
  const { syncDBStatus }: AuthState = useSelector(
    (state: RootState) => state.auth
  );
  const { posts, loading: postsLoading } = useSelector(
    (state: RootState) => state.postList
  );
  const { refreshNewsFeed } = useNewsFeed();
  useSnackbarNotificationAndRefreshNewsFeed();

  useEffect(() => {
    if ((session as any)?.error === "RefreshAccessTokenError") {
      signIn(); // Force sign in to hopefully resolve error
    }
  }, [session]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Home</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <LeftSide currentPage={appPages.home} />
        <div className={styles.contentContainer}>
          <HomeNavigation />
          <UserStatusInput refreshNewsFeed={refreshNewsFeed} />
          <RecommendFollowableUsers />

          <div className={styles.listPost}>
            {postsLoading == "loading" || syncDBStatus == "pending" ? (
              <AppPageLoading />
            ) : (
              posts.map((post: PostState) => (
                <EvaluationPost
                  key={post.id}
                  postState={post}
                  refreshNewsFeed={refreshNewsFeed}
                />
              ))
            )}
          </div>
        </div>
        <RightSide />
      </main>
      <CustomizedSnackbars />
      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}